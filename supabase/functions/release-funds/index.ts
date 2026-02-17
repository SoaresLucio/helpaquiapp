import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { paymentId } = await req.json();
    if (!paymentId) {
      return new Response(
        JSON.stringify({ error: "Payment ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Get payment details
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .single();

    if (paymentError || !payment) {
      return new Response(
        JSON.stringify({ error: "Payment not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Only the client who made the payment can release funds
    if (payment.client_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (payment.status !== "processing" && payment.status !== "completed") {
      return new Response(
        JSON.stringify({ error: "Payment not eligible for fund release" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use Asaas API to create a transfer to the freelancer
    const asaasApiKey = Deno.env.get("ASAAS_API_KEY");
    if (!asaasApiKey) {
      return new Response(
        JSON.stringify({ error: "Payment provider not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get freelancer bank details
    const { data: bankDetails, error: bankError } = await supabase
      .from("bank_details")
      .select("*")
      .eq("user_id", payment.freelancer_id)
      .single();

    if (bankError || !bankDetails) {
      return new Response(
        JSON.stringify({ error: "Freelancer bank details not found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Asaas transfer
    const transferResponse = await fetch("https://www.asaas.com/api/v3/transfers", {
      method: "POST",
      headers: {
        "access_token": asaasApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        value: payment.freelancer_amount / 100, // Convert cents to reais
        bankAccount: {
          bank: { code: bankDetails.bank_name },
          accountName: "Freelancer",
          account: bankDetails.account_number,
          accountDigit: "",
          agency: bankDetails.branch,
          agencyDigit: "",
          ownerName: "Freelancer",
          cpfCnpj: bankDetails.document,
          type: bankDetails.account_type === "corrente" ? "CONTA_CORRENTE" : "CONTA_POUPANCA",
        },
        operationType: "PIX",
        description: `Repasse serviço ${payment.service_id}`,
      }),
    });

    if (!transferResponse.ok) {
      // Update status but don't expose API details
      await supabase
        .from("payments")
        .update({ status: "transfer_failed", updated_at: new Date().toISOString() })
        .eq("id", paymentId);

      return new Response(
        JSON.stringify({ error: "Fund transfer failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update payment status to completed
    await supabase
      .from("payments")
      .update({ status: "completed", updated_at: new Date().toISOString() })
      .eq("id", paymentId);

    // Log the transaction
    await supabase.from("payment_logs").insert({
      payment_id: paymentId,
      action: "funds_released",
      amount: payment.freelancer_amount,
    });

    // Notify freelancer
    await supabase.from("notifications").insert({
      user_id: payment.freelancer_id,
      title: "Pagamento recebido!",
      message: `Você recebeu R$ ${(payment.freelancer_amount / 100).toFixed(2)} pelo serviço realizado.`,
      type: "success",
      metadata: { payment_id: paymentId },
    });

    return new Response(
      JSON.stringify({ success: true, message: "Funds released successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Fund release failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
