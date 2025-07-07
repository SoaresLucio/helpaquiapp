import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const validateInput = (input: any) => {
  if (!input) throw new Error('Input is required');
  
  const { freelancerId, serviceRequestId } = input;
  
  if (!freelancerId || typeof freelancerId !== 'string') {
    throw new Error('Valid freelancer ID is required');
  }
  
  return { freelancerId, serviceRequestId };
};

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
    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header is required');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    const requestData = await req.json();
    const { freelancerId, serviceRequestId } = validateInput(requestData);

    // Get the service request to find the client
    const { data: serviceRequest, error: requestError } = await supabase
      .from('service_requests')
      .select('client_id')
      .eq('id', serviceRequestId)
      .single();

    if (requestError || !serviceRequest) {
      throw new Error('Service request not found');
    }

    const clientId = serviceRequest.client_id;

    // Check if conversation already exists
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('*')
      .eq('client_id', clientId)
      .eq('freelancer_id', freelancerId)
      .eq('service_request_id', serviceRequestId)
      .maybeSingle();

    if (existingConv) {
      return new Response(
        JSON.stringify({ success: true, conversation: existingConv }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create new conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        client_id: clientId,
        freelancer_id: freelancerId,
        service_request_id: serviceRequestId
      })
      .select()
      .single();

    if (convError) {
      throw new Error(`Failed to create conversation: ${convError.message}`);
    }

    // Create welcome notification for client
    await supabase
      .from('notifications')
      .insert({
        user_id: clientId,
        title: 'Nova conversa iniciada',
        message: 'Um freelancer iniciou uma conversa com você sobre sua solicitação',
        type: 'info',
        metadata: { conversation_id: conversation.id }
      });

    return new Response(
      JSON.stringify({ success: true, conversation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Create conversation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});