import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_type: string;
  content: string;
  metadata: any;
  is_read: boolean;
  created_at: string;
  _optimistic?: boolean;
  _failed?: boolean;
}

export interface Conversation {
  id: string;
  client_id: string;
  freelancer_id: string;
  service_request_id?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useRealTimeChat = (conversationId?: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const optimisticMap = useRef<Map<string, string>>(new Map()); // tempId -> not used yet

  const loadConversations = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`client_id.eq.${user.id},freelancer_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      setConversations((data || []) as Conversation[]);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }, [user]);

  const loadMessages = useCallback(async (convId: string) => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setMessages((data || []) as ChatMessage[]);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Optimistic send: insert temp message immediately, then call edge function.
  const sendMessage = useCallback(async (
    convId: string,
    content: string,
    messageType: 'text' | 'image' | 'file' | 'schedule_suggestion' = 'text',
    metadata: Record<string, any> = {}
  ) => {
    if (!user || (!content.trim() && messageType === 'text')) return;
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const optimistic: ChatMessage = {
      id: tempId,
      conversation_id: convId,
      sender_id: user.id,
      message_type: messageType,
      content: content.trim(),
      metadata,
      is_read: false,
      created_at: new Date().toISOString(),
      _optimistic: true,
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      setSending(true);
      const { error } = await supabase.functions.invoke('send-chat-message', {
        body: { conversationId: convId, content: content.trim(), messageType, metadata },
      });
      if (error) throw error;
      // Real message will arrive via realtime INSERT; remove optimistic placeholder there.
      // As fallback if realtime is delayed, mark as delivered after 4s.
      setTimeout(() => {
        setMessages(prev => prev.map(m => m.id === tempId ? { ...m, _optimistic: false } : m));
      }, 4000);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, _failed: true, _optimistic: false } : m));
      throw error;
    } finally {
      setSending(false);
    }
  }, [user]);

  const createConversation = useCallback(async (freelancerId: string, serviceRequestId?: string) => {
    if (!user) return null;
    try {
      const { data, error } = await supabase.functions.invoke('create-conversation', {
        body: { freelancerId, serviceRequestId },
      });
      if (error) throw error;
      return data.conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }, [user]);

  const markAsRead = useCallback(async (convId: string) => {
    if (!user) return;
    try {
      await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('conversation_id', convId)
        .neq('sender_id', user.id);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [user]);

  // Realtime: append/update on changes instead of full reload.
  useEffect(() => {
    if (!user || !conversationId) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages(prev => {
            // Replace any optimistic message from same sender with same content
            const idx = prev.findIndex(m =>
              m._optimistic &&
              m.sender_id === newMsg.sender_id &&
              m.content === newMsg.content &&
              m.message_type === newMsg.message_type
            );
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = newMsg;
              return next;
            }
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'chat_messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const upd = payload.new as ChatMessage;
          setMessages(prev => prev.map(m => m.id === upd.id ? { ...m, ...upd } : m));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, conversationId]);

  // Conversation list channel
  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel('user-conversations')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        () => loadConversations()
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, loadConversations]);

  useEffect(() => {
    if (user) {
      loadConversations();
      if (conversationId) loadMessages(conversationId);
    }
  }, [user, conversationId, loadConversations, loadMessages]);

  return {
    messages,
    conversations,
    loading,
    sending,
    userId: user?.id ?? null,
    sendMessage,
    createConversation,
    markAsRead,
    loadMessages,
    loadConversations,
  };
};
