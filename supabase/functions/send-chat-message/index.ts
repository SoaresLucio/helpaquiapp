import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation, sanitization, and phone number blocking
const PHONE_PATTERNS = [
  /\(?\d{2}\)?\s*\d{4,5}[-.\s]?\d{4}/g,
  /(\d[\s\-._]*){8,}/g,
  /(\d\s+){6,}\d/g,
  /\+?\d{1,3}[\s\-]?\(?\d{2}\)?[\s\-]?\d{4,5}[\s\-]?\d{4}/g,
];

const BLOCKED_KEYWORDS = [
  /whats\s*app/gi, /wpp/gi, /w\.a/gi, /zap/gi, /zapzap/gi,
  /telegram/gi, /t\.me/gi, /signal/gi, /discord/gi,
  /meu\s*(numero|número|tel|telefone|celular|cell|fone)/gi,
];

const LINK_PATTERNS = [
  /https?:\/\/[^\s]+/gi,
  /www\.[^\s]+/gi,
];

const containsBlockedContent = (text: string): string | null => {
  for (const p of BLOCKED_KEYWORDS) {
    p.lastIndex = 0;
    if (p.test(text)) return 'Contatos externos não permitidos';
  }
  for (const p of LINK_PATTERNS) {
    p.lastIndex = 0;
    if (p.test(text)) return 'Links não permitidos';
  }
  for (const p of PHONE_PATTERNS) {
    p.lastIndex = 0;
    const matches = text.match(p);
    if (matches) {
      for (const m of matches) {
        if (m.replace(/\D/g, '').length >= 8) return 'Números de telefone não permitidos';
      }
    }
  }
  // Check overall digit count in sequences
  const seqs = text.match(/[\d\s\-._]{8,}/g);
  if (seqs) {
    for (const s of seqs) {
      if (s.replace(/\D/g, '').length >= 8) return 'Sequências numéricas não permitidas';
    }
  }
  return null;
};

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
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .slice(0, 2000);
  
  // Check for blocked content (phone numbers, WhatsApp, etc.)
  const blockReason = containsBlockedContent(sanitizedContent);
  if (blockReason) {
    throw new Error(blockReason);
  }
  
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