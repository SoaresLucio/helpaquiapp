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
  
  // serviceRequestId is optional for direct conversations
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

    let clientId = user.id; // Default to current user as client

    // If serviceRequestId is provided, get the client from service request
    if (serviceRequestId) {
      const { data: serviceRequest, error: requestError } = await supabase
        .from('service_requests')
        .select('client_id')
        .eq('id', serviceRequestId)
        .single();

      if (requestError || !serviceRequest) {
        throw new Error('Service request not found');
      }

      clientId = serviceRequest.client_id;
    }

    // Check if conversation already exists
    let existingConvQuery = supabase
      .from('conversations')
      .select('*')
      .eq('client_id', clientId)
      .eq('freelancer_id', freelancerId);

    if (serviceRequestId) {
      existingConvQuery = existingConvQuery.eq('service_request_id', serviceRequestId);
    } else {
      existingConvQuery = existingConvQuery.is('service_request_id', null);
    }

    const { data: existingConv } = await existingConvQuery.maybeSingle();

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
        service_request_id: serviceRequestId || null
      })
      .select()
      .single();

    if (convError) {
      throw new Error(`Failed to create conversation: ${convError.message}`);
    }

    // Create welcome notification
    const notificationMessage = serviceRequestId 
      ? 'Uma nova conversa foi iniciada sobre sua solicitação'
      : 'Uma nova conversa direta foi iniciada com você';

    // Notify the other party (if current user is client, notify freelancer, and vice versa)
    const notifyUserId = clientId === user.id ? freelancerId : clientId;
    
    await supabase
      .from('notifications')
      .insert({
        user_id: notifyUserId,
        title: 'Nova conversa iniciada',
        message: notificationMessage,
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