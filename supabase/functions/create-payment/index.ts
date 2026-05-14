
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

    // Accept only identifiers from client. Amount is derived server-side.
    const { serviceId, proposalId, freelancerId, description } = await req.json();

    if (!serviceId || typeof serviceId !== "string") {
      throw new Error("Invalid serviceId");
    }

    // Server-side rate limit (10 payment attempts / hour per user)
    try {
      const { data: rlOk } = await supabaseClient.rpc("check_rate_limit", {
        p_user_id: userData.user.id,
        p_action_type: "create_payment",
        p_max_requests: 10,
        p_window_minutes: 60,
      });
      if (rlOk === false) {
        return new Response(
          JSON.stringify({ success: false, error: "Too many requests. Try again later." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
        );
      }
    } catch (_) { /* fail-open on RPC error */ }

    // Resolve canonical price from DB — never trust client
    let amount = 0;
    let resolvedFreelancerId: string | null = freelancerId ?? null;

    if (proposalId && typeof proposalId === "string") {
      const { data: prop } = await supabaseClient
        .from("service_proposals")
        .select("proposed_price, freelancer_id, service_request_id")
        .eq("id", proposalId)
        .maybeSingle();
      if (!prop || prop.service_request_id !== serviceId) {
        throw new Error("Proposal not found for this service");
      }
      amount = Number(prop.proposed_price ?? 0);
      resolvedFreelancerId = prop.freelancer_id;
    }

    if (!amount || amount <= 0) {
      const { data: req_, error: reqErr } = await supabaseClient
        .from("service_requests")
        .select("budget_max, client_id")
        .eq("id", serviceId)
        .maybeSingle();
      if (reqErr || !req_) throw new Error("Service request not found");
      if (req_.client_id !== userData.user.id) throw new Error("Not authorized for this request");
      amount = Number(req_.budget_max ?? 0);
    }

    if (!amount || amount <= 0 || amount > 10_000_000) {
      throw new Error("Could not determine a valid payment amount");
    }

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
        freelancerId: resolvedFreelancerId ?? "",
        clientId: userData.user.id,
        platformFee: platformFee.toString(),
        freelancerAmount: freelancerAmount.toString(),
      },
    });

    const { error: insertError } = await supabaseClient.from("payments").insert({
      stripe_session_id: session.id,
      service_id: serviceId,
      freelancer_id: resolvedFreelancerId,
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
