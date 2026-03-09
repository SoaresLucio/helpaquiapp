import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ASAAS_BASE_URL = 'https://www.asaas.com/api/v3';

function isValidCpf(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cleaned[i]) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(cleaned[9])) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cleaned[i]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  return remainder === parseInt(cleaned[10]);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Authorization header is required');

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error('Invalid authentication');

    const { planId, amount, cpf: providedCpf } = await req.json();
    if (!planId || typeof planId !== 'string') throw new Error('Valid plan ID is required');
    if (!amount || typeof amount !== 'number' || amount <= 0) throw new Error('Valid amount is required');

    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) throw new Error('Plan not found');
    if (Math.abs(plan.price_monthly - amount) > 0.01) throw new Error('Amount does not match plan price');

    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, email, phone')
      .eq('id', user.id)
      .single();

    const userName = profile
      ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Usuário HelpAqui'
      : 'Usuário HelpAqui';
    const userEmail = profile?.email || user.email || '';

    // Try to get CPF from: 1) request body, 2) profile_verifications
    let validCpf: string | null = null;
    
    // First check if CPF was provided in the request
    if (providedCpf) {
      const cleanedProvidedCpf = providedCpf.replace(/\D/g, '');
      if (isValidCpf(cleanedProvidedCpf)) {
        validCpf = cleanedProvidedCpf;
      }
    }
    
    // If not provided or invalid, try profile_verifications
    if (!validCpf) {
      const { data: verification } = await supabase
        .from('profile_verifications')
        .select('additional_data')
        .eq('user_id', user.id)
        .eq('verification_type', 'document')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const additionalData = verification?.additional_data as Record<string, unknown> | null;
      const rawCpf = (additionalData?.cpf as string) || (additionalData?.document_number as string) || '';
      const cleanCpf = rawCpf.replace(/\D/g, '');
      if (isValidCpf(cleanCpf)) {
        validCpf = cleanCpf;
      }
    }

    const asaasApiKey = Deno.env.get('ASAAS_API_KEY');
    if (!asaasApiKey) throw new Error('ASAAS_API_KEY not configured');

    // Step 1: Find or create ASAAS customer
    let asaasCustomerId: string;

    const searchResponse = await fetch(
      `${ASAAS_BASE_URL}/customers?email=${encodeURIComponent(userEmail)}&limit=1`,
      { headers: { 'access_token': asaasApiKey } }
    );

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      if (searchData.data?.length > 0) {
        asaasCustomerId = searchData.data[0].id;
      } else {
        // Create customer - cpfCnpj is required by ASAAS
        if (!validCpf) {
          throw new Error('CPF não encontrado ou inválido. Por favor, verifique seu perfil e adicione um CPF válido na seção de verificação de documentos.');
        }

        const customerBody: Record<string, unknown> = {
          name: userName,
          email: userEmail,
          cpfCnpj: validCpf,
          externalReference: user.id,
        };
        if (profile?.phone) customerBody.phone = profile.phone;

        const customerResponse = await fetch(`${ASAAS_BASE_URL}/customers`, {
          method: 'POST',
          headers: { 'access_token': asaasApiKey, 'Content-Type': 'application/json' },
          body: JSON.stringify(customerBody),
        });

        if (!customerResponse.ok) {
          const errText = await customerResponse.text();
          console.error('ASAAS customer creation failed:', errText);
          throw new Error('Falha ao criar cliente no gateway de pagamento. Verifique seus dados cadastrais e CPF.');
        }

        const customerData = await customerResponse.json();
        asaasCustomerId = customerData.id;
      }
    } else {
      throw new Error('Failed to search payment customers');
    }

    // Step 2: Create PIX payment in ASAAS
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);

    const paymentResponse = await fetch(`${ASAAS_BASE_URL}/payments`, {
      method: 'POST',
      headers: { 'access_token': asaasApiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: asaasCustomerId,
        billingType: 'PIX',
        value: amount,
        dueDate: dueDate.toISOString().split('T')[0],
        description: `Assinatura ${plan.name} - HelpAqui`,
        externalReference: `sub_${planId}_${user.id}`,
      }),
    });

    if (!paymentResponse.ok) {
      const errText = await paymentResponse.text();
      console.error('ASAAS payment creation failed:', errText);
      throw new Error('Falha ao criar cobrança PIX');
    }

    const asaasPayment = await paymentResponse.json();

    // Step 3: Get PIX QR Code
    let pixCode = '';
    let qrCodeUrl = '';

    const pixQrResponse = await fetch(
      `${ASAAS_BASE_URL}/payments/${asaasPayment.id}/pixQrCode`,
      { headers: { 'access_token': asaasApiKey } }
    );

    if (pixQrResponse.ok) {
      const pixData = await pixQrResponse.json();
      pixCode = pixData.payload || '';
      qrCodeUrl = pixData.encodedImage ? `data:image/png;base64,${pixData.encodedImage}` : '';
    } else {
      console.error('Failed to get PIX QR code, using fallback');
      pixCode = asaasPayment.invoiceUrl || '';
    }

    // Step 4: Store in pix_payments table
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);

    const { data: pixPayment, error: pixError } = await supabase
      .from('pix_payments')
      .insert({
        user_id: user.id,
        amount,
        pix_code: pixCode,
        qr_code_url: qrCodeUrl,
        expires_at: expiresAt.toISOString(),
        status: 'pending',
        asaas_payment_id: asaasPayment.id,
      })
      .select()
      .single();

    if (pixError) throw new Error(`Failed to create PIX payment record: ${pixError.message}`);

    await supabase.from('notifications').insert({
      user_id: user.id,
      title: 'PIX gerado com sucesso',
      message: `PIX para assinatura ${plan.name} gerado. Valor: R$ ${amount.toFixed(2).replace('.', ',')}`,
      type: 'success',
      metadata: { pix_payment_id: pixPayment.id, plan_id: planId },
    });

    return new Response(
      JSON.stringify({
        success: true,
        pixCode,
        qrCodeUrl,
        amount,
        expiresAt: expiresAt.toISOString(),
        pixPaymentId: pixPayment.id,
        asaasCustomerId,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Generate PIX payment error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'PIX payment generation failed' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
