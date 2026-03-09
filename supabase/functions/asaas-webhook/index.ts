import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, asaas-access-token',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify webhook token from Asaas
    const webhookToken = Deno.env.get('ASAAS_WEBHOOK_TOKEN')
    if (!webhookToken) {
      console.error('ASAAS_WEBHOOK_TOKEN not configured')
      return new Response(
        JSON.stringify({ error: 'Webhook not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Asaas sends a token in the asaas-access-token header for webhook verification
    const incomingToken = req.headers.get('asaas-access-token')
    if (!incomingToken || incomingToken !== webhookToken) {
      console.error('Invalid webhook token')
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json()
    const { event, payment } = body

    if (!event || !payment) {
      return new Response(
        JSON.stringify({ error: 'Invalid webhook payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Asaas webhook received: ${event}, payment: ${payment.id}`)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Map Asaas events to internal status
    let newStatus: string | null = null
    switch (event) {
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_CONFIRMED':
        newStatus = 'completed'
        break
      case 'PAYMENT_OVERDUE':
        newStatus = 'failed'
        break
      case 'PAYMENT_DELETED':
      case 'PAYMENT_REFUNDED':
        newStatus = 'cancelled'
        break
      case 'PAYMENT_CREATED':
      case 'PAYMENT_UPDATED':
        newStatus = 'pending'
        break
      default:
        console.log(`Unhandled event: ${event}`)
    }

    if (newStatus) {
      // Update payments table
      const { error: paymentError } = await supabase
        .from('payments')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('stripe_session_id', payment.id)

      if (paymentError) {
        console.error('Error updating payment:', paymentError)
      }

      // Update pix_payments table
      const { error: pixError } = await supabase
        .from('pix_payments')
        .update({ status: newStatus === 'completed' ? 'paid' : newStatus })
        .eq('asaas_payment_id', payment.id)

      if (pixError) {
        console.error('Error updating pix_payment:', pixError)
      }

      // Log the webhook event
      await supabase.from('payment_logs').insert({
        payment_id: null,
        action: `webhook_${event}`,
        amount: payment.value ? Math.round(payment.value * 100) : null,
      })
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
