import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ASAAS_BASE_URL = 'https://www.asaas.com/api/v3';

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
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Authorization header is required');

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error('Invalid authentication');

    const requestData = await req.json();
    const { planId, amount } = requestData;

    if (!planId || typeof planId !== 'string') throw new Error('Valid plan ID is required');
    if (!amount || typeof amount !== 'number' || amount <= 0) throw new Error('Valid amount is required');

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) throw new Error('Plan not found');

    // Validate amount matches plan price
    if (Math.abs(plan.price_monthly - amount) > 0.01) {
      throw new Error('Amount does not match plan price');
    }

    // Get user profile for ASAAS customer creation
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, email, phone')
      .eq('id', user.id)
      .single();

    const userName = profile
      ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Usuário HelpAqui'
      : 'Usuário HelpAqui';
    const userEmail = profile?.email || user.email || '';

    // Try to get CPF from profile_verifications
    const { data: verification } = await supabase
      .from('profile_verifications')
      .select('additional_data')
      .eq('user_id', user.id)
      .eq('verification_type', 'document')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const additionalData = verification?.additional_data as Record<string, unknown> | null;
    const cpf = (additionalData?.cpf as string) || 
                (additionalData?.document_number as string) ||
                user.id.replace(/-/g, '').substring(0, 11);

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
        // Create new customer
        const customerResponse = await fetch(`${ASAAS_BASE_URL}/customers`, {
          method: 'POST',
          headers: {
            'access_token': asaasApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: userName,
            email: userEmail,
            cpfCnpj: cpf,
            phone: profile?.phone || undefined,
            externalReference: user.id,
          }),
        });

        if (!customerResponse.ok) {
          const errText = await customerResponse.text();
          console.error('ASAAS customer creation failed:', errText);
          throw new Error('Falha ao criar cliente no gateway de pagamento. Verifique seus dados cadastrais.');
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
      headers: {
        'access_token': asaasApiKey,
        'Content-Type': 'application/json',
      },
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

    // Step 3: Get PIX QR Code from ASAAS
    let pixCode = '';
    let qrCodeUrl = '';

    const pixQrResponse = await fetch(
      `${ASAAS_BASE_URL}/payments/${asaasPayment.id}/pixQrCode`,
      { headers: { 'access_token': asaasApiKey } }
    );

    if (pixQrResponse.ok) {
      const pixData = await pixQrResponse.json();
      pixCode = pixData.payload || '';
      qrCodeUrl = pixData.encodedImage
        ? `data:image/png;base64,${pixData.encodedImage}`
        : '';
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
        amount: amount,
        pix_code: pixCode,
        qr_code_url: qrCodeUrl,
        expires_at: expiresAt.toISOString(),
        status: 'pending',
        asaas_payment_id: asaasPayment.id,
      })
      .select()
      .single();

    if (pixError) {
      throw new Error(`Failed to create PIX payment record: ${pixError.message}`);
    }

    // Create notification
    await supabase
      .from('notifications')
      .insert({
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
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Generate PIX payment error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'PIX payment generation failed' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
