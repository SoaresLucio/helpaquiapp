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

    const { paymentId } = await req.json()
    
    if (!paymentId) {
      return new Response(
        JSON.stringify({ error: 'Payment ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify ownership: ensure this payment belongs to the requesting user
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: payment, error: ownershipError } = await supabase
      .from('payments')
      .select('id, client_id')
      .eq('stripe_session_id', paymentId)
      .eq('client_id', user.id)
      .maybeSingle()

    if (ownershipError || !payment) {
      return new Response(
        JSON.stringify({ error: 'Payment not found or access denied' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get ASAAS API key from environment
    const asaasApiKey = Deno.env.get('ASAAS_API_KEY')
    
    if (!asaasApiKey) {
      return new Response(
        JSON.stringify({ error: 'Payment gateway not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check payment status in ASAAS
    const asaasResponse = await fetch(`https://www.asaas.com/api/v3/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'access_token': asaasApiKey,
        'Content-Type': 'application/json',
      },
    })

    if (!asaasResponse.ok) {
      const errorText = await asaasResponse.text()
      console.error('ASAAS API Error:', errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to check payment status in ASAAS' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const asaasPayment = await asaasResponse.json()

    // Update payment status in database (reuse supabase client from above)

    let newStatus = 'pending'
    if (asaasPayment.status === 'RECEIVED') {
      newStatus = 'completed'
    } else if (asaasPayment.status === 'OVERDUE') {
      newStatus = 'failed'
    }

    const { error: updateError } = await supabase
      .from('payments')
      .update({ status: newStatus })
      .eq('stripe_session_id', paymentId)

    if (updateError) {
      console.error('Database update error:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update payment status' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({
        status: asaasPayment.status,
        isPaid: asaasPayment.status === 'RECEIVED',
        paymentDate: asaasPayment.paymentDate,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error checking ASAAS payment:', error)
    return new Response(
      JSON.stringify({ error: 'Payment check failed' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})