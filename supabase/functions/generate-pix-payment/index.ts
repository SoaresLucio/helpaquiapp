import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const validateInput = (input: any) => {
  if (!input) throw new Error('Input is required');
  
  const { planId, amount } = input;
  
  if (!planId || typeof planId !== 'string') {
    throw new Error('Valid plan ID is required');
  }
  
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    throw new Error('Valid amount is required');
  }
  
  return { planId, amount };
};

// Generate a realistic PIX code
const generatePixCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Generate QR code data (EMV format simulation)
const generateQrCodeData = (pixCode: string, amount: number, description: string) => {
  return `00020126580014BR.GOV.BCB.PIX013659b5e3d3-4a36-4c41-8c0a-8b3a7d6f2e1e5204000053039865406${amount.toFixed(2).replace('.', '')}5925HELPAQUI SERVICOS LTDA6014SAO PAULO6304${pixCode}`;
};

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
    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header is required');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    const requestData = await req.json();
    const { planId, amount } = validateInput(requestData);

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      throw new Error('Plan not found');
    }

    // Generate PIX code and QR data
    const pixCode = generatePixCode();
    const qrCodeData = generateQrCodeData(pixCode, amount, `Assinatura ${plan.name}`);
    
    // In a real implementation, you would call Asaas or Stripe API here
    // For now, we'll simulate the response structure
    
    // Create PIX payment record
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30 minutes expiry

    const { data: pixPayment, error: pixError } = await supabase
      .from('pix_payments')
      .insert({
        user_id: user.id,
        subscription_id: planId,
        amount: amount,
        pix_code: pixCode,
        qr_code_url: `data:text/plain,${qrCodeData}`, // In real implementation, generate actual QR image
        expires_at: expiresAt.toISOString(),
        status: 'pending'
      })
      .select()
      .single();

    if (pixError) {
      throw new Error(`Failed to create PIX payment: ${pixError.message}`);
    }

    // Create notification
    await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        title: 'PIX gerado com sucesso',
        message: `PIX para assinatura ${plan.name} gerado. Código: ${pixCode}`,
        type: 'success',
        metadata: { pix_payment_id: pixPayment.id, plan_id: planId }
      });

    return new Response(
      JSON.stringify({
        success: true,
        pixCode,
        qrCodeData,
        amount,
        expiresAt: expiresAt.toISOString(),
        paymentId: pixPayment.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Generate PIX payment error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});