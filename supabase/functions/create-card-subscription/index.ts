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
  let r = (sum * 10) % 11;
  if (r === 10) r = 0;
  if (r !== parseInt(cleaned[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cleaned[i]) * (11 - i);
  r = (sum * 10) % 11;
  if (r === 10) r = 0;
  return r === parseInt(cleaned[10]);
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
    if (!authHeader) throw new Error('Authorization required');

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error('Invalid authentication');

    const { planId, cardData } = await req.json();
    if (!planId) throw new Error('Plan ID is required');
    if (!cardData?.holderName || !cardData?.number || !cardData?.expiryMonth || !cardData?.expiryYear || !cardData?.ccv) {
      throw new Error('Card data is incomplete');
    }

    const asaasApiKey = Deno.env.get('ASAAS_API_KEY');
    if (!asaasApiKey) throw new Error('ASAAS_API_KEY not configured');

    // Get plan
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();
    if (planError || !plan) throw new Error('Plan not found');
    if (plan.price_monthly <= 0) throw new Error('Free plans do not require payment');

    // Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, email, phone, address')
      .eq('id', user.id)
      .single();

    const userName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Usuário HelpAqui' : 'Usuário HelpAqui';
    const userEmail = profile?.email || user.email || '';

    // Get CPF
    const { data: verification } = await supabase
      .from('profile_verifications')
      .select('additional_data')
      .eq('user_id', user.id)
      .eq('verification_type', 'document')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const additionalData = verification?.additional_data as Record<string, unknown> | null;
    const rawCpf = (additionalData?.cpf as string) || (additionalData?.document_number as string) || (cardData.cpf || '');
    const cleanCpf = rawCpf.replace(/\D/g, '');
    if (!isValidCpf(cleanCpf)) {
      throw new Error('CPF inválido. Verifique seu perfil ou informe um CPF válido.');
    }

    // Find or create ASAAS customer
    let asaasCustomerId: string;
    const searchResp = await fetch(
      `${ASAAS_BASE_URL}/customers?email=${encodeURIComponent(userEmail)}&limit=1`,
      { headers: { 'access_token': asaasApiKey } }
    );

    if (!searchResp.ok) throw new Error('Failed to search customers');
    const searchData = await searchResp.json();

    if (searchData.data?.length > 0) {
      asaasCustomerId = searchData.data[0].id;
    } else {
      const custBody: Record<string, unknown> = {
        name: userName,
        email: userEmail,
        cpfCnpj: cleanCpf,
        externalReference: user.id,
      };
      if (profile?.phone) custBody.phone = profile.phone;

      const custResp = await fetch(`${ASAAS_BASE_URL}/customers`, {
        method: 'POST',
        headers: { 'access_token': asaasApiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify(custBody),
      });

      if (!custResp.ok) {
        const err = await custResp.text();
        console.error('ASAAS customer creation failed:', err);
        throw new Error('Falha ao criar cliente. Verifique seus dados cadastrais.');
      }
      asaasCustomerId = (await custResp.json()).id;
    }

    // Create ASAAS subscription with CREDIT_CARD
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + 1);

    const subscriptionBody: Record<string, unknown> = {
      customer: asaasCustomerId,
      billingType: 'CREDIT_CARD',
      value: plan.price_monthly,
      nextDueDate: nextDueDate.toISOString().split('T')[0],
      cycle: 'MONTHLY',
      description: `Assinatura ${plan.name} - HelpAqui`,
      externalReference: `sub_${planId}_${user.id}`,
      creditCard: {
        holderName: cardData.holderName,
        number: cardData.number.replace(/\s/g, ''),
        expiryMonth: cardData.expiryMonth,
        expiryYear: cardData.expiryYear,
        ccv: cardData.ccv,
      },
      creditCardHolderInfo: {
        name: cardData.holderName,
        email: userEmail,
        cpfCnpj: cleanCpf,
        phone: profile?.phone || '',
        postalCode: cardData.postalCode || '00000000',
        addressNumber: cardData.addressNumber || '0',
      },
    };

    const subResp = await fetch(`${ASAAS_BASE_URL}/subscriptions`, {
      method: 'POST',
      headers: { 'access_token': asaasApiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(subscriptionBody),
    });

    if (!subResp.ok) {
      const errText = await subResp.text();
      console.error('ASAAS subscription creation failed:', errText);
      
      // Parse specific error
      try {
        const errData = JSON.parse(errText);
        const desc = errData.errors?.[0]?.description || 'Falha ao processar cartão';
        throw new Error(desc);
      } catch (e) {
        if (e instanceof Error && !e.message.includes('JSON')) throw e;
        throw new Error('Falha ao criar assinatura com cartão. Verifique os dados do cartão.');
      }
    }

    const asaasSubscription = await subResp.json();

    // Activate subscription in our DB
    const now = new Date();
    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + 30);

    const { data: existingSub } = await supabase
      .from('user_subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (existingSub) {
      await supabase.from('user_subscriptions').update({
        plan_id: planId,
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        requests_used_this_month: 0,
        messages_used_this_month: 0,
        stripe_subscription_id: asaasSubscription.id, // reusing field for asaas ref
        updated_at: now.toISOString(),
      }).eq('id', existingSub.id);
    } else {
      await supabase.from('user_subscriptions').insert({
        user_id: user.id,
        plan_id: planId,
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        requests_used_this_month: 0,
        messages_used_this_month: 0,
        stripe_subscription_id: asaasSubscription.id,
      });
    }

    // History record
    await supabase.from('user_subscriptions_flow').insert({
      user_id: user.id,
      plan_name: plan.name,
      plan_price: plan.price_monthly,
      start_date: now.toISOString(),
      end_date: periodEnd.toISOString(),
      payment_method: 'credit_card',
      payment_reference: asaasSubscription.id,
      status: 'active',
    });

    // Save card last 4 digits
    const cardLast4 = cardData.number.replace(/\s/g, '').slice(-4);
    await supabase.from('payment_methods').insert({
      user_id: user.id,
      method_type: 'credit_card',
      card_last_four: cardLast4,
      card_brand: detectCardBrand(cardData.number),
      is_default: true,
      is_active: true,
    });

    // Notification
    await supabase.from('notifications').insert({
      user_id: user.id,
      title: 'Assinatura ativada!',
      message: `Seu plano ${plan.name} foi ativado com cobrança automática no cartão final ${cardLast4}.`,
      type: 'success',
      metadata: { plan_id: planId, subscription_id: asaasSubscription.id },
    });

    return new Response(
      JSON.stringify({
        success: true,
        subscriptionId: asaasSubscription.id,
        message: 'Assinatura criada com sucesso! Cobrança mensal automática ativada.',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Create card subscription error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Card subscription creation failed' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function detectCardBrand(number: string): string {
  const n = number.replace(/\s/g, '');
  if (/^4/.test(n)) return 'visa';
  if (/^5[1-5]/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  if (/^6(?:011|5)/.test(n)) return 'discover';
  if (/^(636368|438935|504175|451416|636297)/.test(n) || /^50[0-9]{2,}/.test(n)) return 'elo';
  return 'other';
}
