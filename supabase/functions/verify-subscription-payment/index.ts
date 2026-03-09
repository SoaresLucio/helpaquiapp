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
    if (!authHeader) throw new Error('Authorization required');

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error('Invalid authentication');

    const { pixPaymentId, planId } = await req.json();
    if (!pixPaymentId || !planId) throw new Error('pixPaymentId and planId are required');

    // Get pix_payment record (verify ownership)
    const { data: pixPayment, error: pixError } = await supabase
      .from('pix_payments')
      .select('*')
      .eq('id', pixPaymentId)
      .eq('user_id', user.id)
      .single();

    if (pixError || !pixPayment) throw new Error('PIX payment not found or access denied');

    // Already paid? Return success immediately
    if (pixPayment.status === 'paid') {
      return new Response(
        JSON.stringify({ isPaid: true, alreadyActivated: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if expired
    if (new Date(pixPayment.expires_at) < new Date()) {
      await supabase
        .from('pix_payments')
        .update({ status: 'expired' })
        .eq('id', pixPaymentId);

      return new Response(
        JSON.stringify({ isPaid: false, status: 'EXPIRED', message: 'PIX expirado. Gere um novo código.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const asaasApiKey = Deno.env.get('ASAAS_API_KEY');
    if (!asaasApiKey) throw new Error('ASAAS_API_KEY not configured');

    // Get ASAAS payment ID from record
    const asaasPaymentId = (pixPayment as any).asaas_payment_id;
    if (!asaasPaymentId) {
      throw new Error('ASAAS payment reference not found. Please generate a new PIX code.');
    }

    // Check payment status in ASAAS
    const asaasResponse = await fetch(
      `${ASAAS_BASE_URL}/payments/${asaasPaymentId}`,
      { headers: { 'access_token': asaasApiKey } }
    );

    if (!asaasResponse.ok) {
      const errText = await asaasResponse.text();
      console.error('ASAAS status check failed:', errText);
      throw new Error('Failed to verify payment status with gateway');
    }

    const asaasPaymentData = await asaasResponse.json();
    const isPaid = ['RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH'].includes(asaasPaymentData.status);

    if (isPaid) {
      // Update pix_payment status to paid
      await supabase
        .from('pix_payments')
        .update({ status: 'paid' })
        .eq('id', pixPaymentId);

      // Get plan details to validate
      const { data: plan } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (!plan) throw new Error('Plan not found');

      // Activate subscription - check for existing active subscription
      const { data: existingSub } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      const now = new Date();
      const periodEnd = new Date();
      periodEnd.setDate(periodEnd.getDate() + 30);

      if (existingSub) {
        // Update existing subscription to new plan
        await supabase
          .from('user_subscriptions')
          .update({
            plan_id: planId,
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
            requests_used_this_month: 0,
            messages_used_this_month: 0,
            updated_at: now.toISOString(),
          })
          .eq('id', existingSub.id);
      } else {
        // Create new subscription
        await supabase
          .from('user_subscriptions')
          .insert({
            user_id: user.id,
            plan_id: planId,
            status: 'active',
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
            requests_used_this_month: 0,
            messages_used_this_month: 0,
          });
      }

      // Also create a record in user_subscriptions_flow for history
      await supabase
        .from('user_subscriptions_flow')
        .insert({
          user_id: user.id,
          plan_name: plan.name,
          plan_price: plan.price_monthly,
          start_date: now.toISOString(),
          end_date: periodEnd.toISOString(),
          payment_method: 'pix',
          payment_reference: asaasPaymentId,
          status: 'active',
        });

      // Create success notification
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: 'Assinatura ativada!',
          message: `Seu plano ${plan.name} foi ativado com sucesso. Aproveite todos os benefícios!`,
          type: 'success',
          metadata: { plan_id: planId, pix_payment_id: pixPaymentId },
        });

      return new Response(
        JSON.stringify({ isPaid: true, subscriptionActivated: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Not paid yet
    const statusMessages: Record<string, string> = {
      PENDING: 'Pagamento ainda não identificado. Aguarde alguns minutos após o pagamento.',
      OVERDUE: 'Pagamento vencido. Gere um novo código PIX.',
      REFUNDED: 'Pagamento estornado.',
      REFUND_REQUESTED: 'Estorno solicitado.',
    };

    return new Response(
      JSON.stringify({
        isPaid: false,
        asaasStatus: asaasPaymentData.status,
        message: statusMessages[asaasPaymentData.status] || 'Pagamento ainda não confirmado.',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Verify subscription payment error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Payment verification failed' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
