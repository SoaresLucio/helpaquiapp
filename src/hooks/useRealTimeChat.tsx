import { useState, useEffect, useCallback } from 'react';
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

  // Load conversations for the current user
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

  // Load messages for a specific conversation
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

  // Send a message
  const sendMessage = useCallback(async (
    convId: string,
    content: string,
    messageType: 'text' | 'image' | 'file' | 'schedule_suggestion' = 'text',
    metadata = {}
  ) => {
    if (!user || !content.trim()) return;

    try {
      setSending(true);
      const { error } = await supabase.functions.invoke('send-chat-message', {
        body: {
          conversationId: convId,
          content: content.trim(),
          messageType,
          metadata
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    } finally {
      setSending(false);
    }
  }, [user]);

  // Create a new conversation
  const createConversation = useCallback(async (
    freelancerId: string,
    serviceRequestId?: string
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.functions.invoke('create-conversation', {
        body: {
          freelancerId,
          serviceRequestId
        }
      });

      if (error) throw error;
      return data.conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }, [user]);

  // Mark messages as read
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

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscribe to conversations
    const conversationsChannel = supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `or(client_id.eq.${user.id},freelancer_id.eq.${user.id})`
        },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    // Subscribe to messages if we have a conversation
    let messagesChannel: any;
    if (conversationId) {
      messagesChannel = supabase
        .channel(`messages-${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'chat_messages',
            filter: `conversation_id=eq.${conversationId}`
          },
          () => {
            loadMessages(conversationId);
          }
        )
        .subscribe();
    }

    return () => {
      supabase.removeChannel(conversationsChannel);
      if (messagesChannel) {
        supabase.removeChannel(messagesChannel);
      }
    };
  }, [user, conversationId, loadConversations, loadMessages]);

  // Load initial data
  useEffect(() => {
    if (user) {
      loadConversations();
      if (conversationId) {
        loadMessages(conversationId);
      }
    }
  }, [user, conversationId, loadConversations, loadMessages]);

  return {
    messages,
    conversations,
    loading,
    sending,
    sendMessage,
    createConversation,
    markAsRead,
    loadMessages,
    loadConversations
  };
};