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

    const { amount, description, freelancerId, serviceId, clientId } = await req.json()
    
    // Verificar se o usuário autenticado é o cliente
    if (user.id !== clientId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: User cannot create payment for another client' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    if (!amount || !description || !freelancerId || !serviceId || !clientId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get ASAAS API key from environment
    const asaasApiKey = Deno.env.get('ASAAS_API_KEY')
    
    if (!asaasApiKey) {
      return new Response(
        JSON.stringify({ error: 'ASAAS API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Calculate platform fee (10%)
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

    // Store payment in database
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        client_id: clientId,
        freelancer_id: freelancerId,
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
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})