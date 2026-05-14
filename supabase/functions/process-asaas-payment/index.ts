import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validação de autenticação
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validar token JWT
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { description, freelancerId, serviceId, clientId, proposalId } = await req.json()

    // Verificar se o usuário autenticado é o cliente
    if (user.id !== clientId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: User cannot create payment for another client' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!description || !freelancerId || !serviceId || !clientId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Service-role client for trusted lookups + writes
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Server-side rate limit
    try {
      const { data: rlOk } = await supabase.rpc('check_rate_limit', {
        p_user_id: user.id,
        p_action_type: 'process_asaas_payment',
        p_max_requests: 10,
        p_window_minutes: 60,
      })
      if (rlOk === false) {
        return new Response(
          JSON.stringify({ error: 'Too many requests. Try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } catch (_) { /* fail-open */ }

    // Resolve canonical amount from DB — never trust client
    let amount = 0
    let resolvedFreelancerId: string = freelancerId

    if (proposalId && typeof proposalId === 'string') {
      const { data: prop } = await supabase
        .from('service_proposals')
        .select('proposed_price, freelancer_id, service_request_id')
        .eq('id', proposalId)
        .maybeSingle()
      if (!prop || prop.service_request_id !== serviceId) {
        return new Response(
          JSON.stringify({ error: 'Proposal not found for this service' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      amount = Number(prop.proposed_price ?? 0)
      resolvedFreelancerId = prop.freelancer_id
    }

    if (!amount || amount <= 0) {
      const { data: sr } = await supabase
        .from('service_requests')
        .select('budget_max, client_id')
        .eq('id', serviceId)
        .maybeSingle()
      if (!sr || sr.client_id !== clientId) {
        return new Response(
          JSON.stringify({ error: 'Service request not found' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      amount = Number(sr.budget_max ?? 0)
    }

    if (!amount || amount <= 0 || amount > 10_000_000) {
      return new Response(
        JSON.stringify({ error: 'Could not determine a valid payment amount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get ASAAS API key from environment
    const asaasApiKey = Deno.env.get('ASAAS_API_KEY')

    if (!asaasApiKey) {
      return new Response(
        JSON.stringify({ error: 'ASAAS API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate platform fee (10%) server-side
    const platformFee = Math.round(amount * 0.1)
    const freelancerAmount = amount - platformFee

    // Create payment in ASAAS
    const asaasResponse = await fetch('https://www.asaas.com/api/v3/payments', {
      method: 'POST',
      headers: {
        'access_token': asaasApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer: clientId,
        billingType: 'PIX',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 24h from now
        value: amount / 100, // Convert from cents to reais
        description: description,
        externalReference: serviceId,
      }),
    })

    if (!asaasResponse.ok) {
      const errorText = await asaasResponse.text()
      console.error('ASAAS API Error:', errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to create payment in ASAAS' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const asaasPayment = await asaasResponse.json()

    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        client_id: clientId,
        freelancer_id: resolvedFreelancerId,
        service_id: serviceId,
        amount: amount,
        platform_fee: platformFee,
        freelancer_amount: freelancerAmount,
        service_title: description,
        status: 'pending',
        stripe_session_id: asaasPayment.id, // Using this field for ASAAS payment ID
      })

    if (paymentError) {
      console.error('Database error:', paymentError)
      return new Response(
        JSON.stringify({ error: 'Failed to save payment to database' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({
        paymentId: asaasPayment.id,
        pixCode: asaasPayment.pixCode,
        qrCodeUrl: asaasPayment.encodedImage,
        amount: amount,
        platformFee: platformFee,
        freelancerAmount: freelancerAmount,
        dueDate: asaasPayment.dueDate,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error processing ASAAS payment:', error)
    return new Response(
      JSON.stringify({ error: 'Payment processing failed' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})