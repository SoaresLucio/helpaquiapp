import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation and sanitization
const validateAndSanitizeInput = (input: any) => {
  if (!input) throw new Error('Input is required');
  
  const { conversationId, content, messageType = 'text', metadata = {} } = input;
  
  if (!conversationId || typeof conversationId !== 'string') {
    throw new Error('Valid conversation ID is required');
  }
  
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    throw new Error('Message content is required');
  }
  
  // Sanitize content
  const sanitizedContent = content
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .slice(0, 2000); // Limit length
  
  const allowedMessageTypes = ['text', 'image', 'file', 'schedule_suggestion'];
  if (!allowedMessageTypes.includes(messageType)) {
    throw new Error('Invalid message type');
  }
  
  return {
    conversationId,
    content: sanitizedContent,
    messageType,
    metadata: typeof metadata === 'object' ? metadata : {}
  };
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
    const { conversationId, content, messageType, metadata } = validateAndSanitizeInput(requestData);

    // Verify user is part of this conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .or(`client_id.eq.${user.id},freelancer_id.eq.${user.id}`)
      .single();

    if (convError || !conversation) {
      throw new Error('Conversation not found or access denied');
    }

    // Insert message
    const { data: message, error: messageError } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        message_type: messageType,
        content,
        metadata
      })
      .select()
      .single();

    if (messageError) {
      throw new Error(`Failed to send message: ${messageError.message}`);
    }

    // Create notification for the other user
    const recipientId = conversation.client_id === user.id 
      ? conversation.freelancer_id 
      : conversation.client_id;
    
    await supabase
      .from('notifications')
      .insert({
        user_id: recipientId,
        title: 'Nova mensagem',
        message: `Você recebeu uma nova mensagem: ${content.slice(0, 50)}...`,
        type: 'info',
        metadata: { conversation_id: conversationId, message_id: message.id }
      });

    return new Response(
      JSON.stringify({ success: true, message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Send message error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});