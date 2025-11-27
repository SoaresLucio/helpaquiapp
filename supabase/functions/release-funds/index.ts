
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization required");
    }

    // Validar token JWT e obter usuário
    const token = authHeader.replace('Bearer ', '');
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      throw new Error("Invalid authentication token");
    }

    const { paymentId } = await req.json();

    // Get payment details
    const { data: payment, error: paymentError } = await supabaseClient
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .single();

    if (paymentError || !payment) {
      throw new Error("Payment not found");
    }

    // Verificar se o usuário autenticado é o cliente que fez o pagamento
    if (payment.client_id !== user.id) {
      throw new Error("Unauthorized: Only the payment client can release funds");
    }

    if (payment.status !== "processing") {
      throw new Error("Payment not in processing status");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Get freelancer bank details
    const { data: bankDetails, error: bankError } = await supabaseClient
      .from("bank_details")
      .select("*")
      .eq("user_id", payment.freelancer_id)
      .single();

    if (bankError || !bankDetails) {
      throw new Error("Freelancer bank details not found");
    }

    // In a real implementation, you would:
    // 1. Create a Stripe transfer to the freelancer's connected account
    // 2. Or use a third-party payment processor for bank transfers
    // For now, we'll simulate the transfer

    console.log("Simulating fund transfer:", {
      amount: payment.freelancer_amount,
      freelancerId: payment.freelancer_id,
      bankDetails: {
        bank: bankDetails.bank_name,
        account: bankDetails.account_number.slice(-4), // Only log last 4 digits
      }
    });

    // Update payment status to completed
    const { error: updateError } = await supabaseClient
      .from("payments")
      .update({ 
        status: "completed",
        updated_at: new Date().toISOString()
      })
      .eq("id", paymentId);

    if (updateError) {
      throw updateError;
    }

    // Log the transaction for audit trail
    await supabaseClient.from("payment_logs").insert({
      payment_id: paymentId,
      action: "funds_released",
      amount: payment.freelancer_amount,
      created_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Funds released successfully"
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Fund release error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Fund release failed"
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400 
      }
    );
  }
});
