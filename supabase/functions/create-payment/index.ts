
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLATFORM_FEE_PCT = 0.10;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization required");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }

    // Only accept amount, serviceId, freelancerId, description from client
    const { amount, serviceId, freelancerId, description } = await req.json();

    // Validate amount
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      throw new Error("Invalid amount");
    }

    // Calculate split server-side — never trust client values
    const platformFee = Math.round(amount * PLATFORM_FEE_PCT);
    const freelancerAmount = amount - platformFee;

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe configuration missing");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    const customers = await stripe.customers.list({ 
      email: userData.user.email,
      limit: 1 
    });
    
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: userData.user.email,
        metadata: {
          user_id: userData.user.id,
        },
      });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: "Serviço HelpAqui",
              description: description,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/payment-cancel`,
      metadata: {
        serviceId,
        freelancerId,
        clientId: userData.user.id,
        platformFee: platformFee.toString(),
        freelancerAmount: freelancerAmount.toString(),
      },
    });

    const { error: insertError } = await supabaseClient.from("payments").insert({
      stripe_session_id: session.id,
      service_id: serviceId,
      freelancer_id: freelancerId,
      client_id: userData.user.id,
      amount: amount,
      platform_fee: platformFee,
      freelancer_amount: freelancerAmount,
      status: "pending",
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("Database insert error:", insertError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: session.url,
        sessionId: session.id
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Payment creation error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Payment processing failed. Please try again."
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400 
      }
    );
  }
});
