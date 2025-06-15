
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

interface AIConversation {
  id: string;
  user_id: string;
  session_id: string;
  status: 'active' | 'transferred_to_human' | 'closed';
  started_at: string;
  ended_at?: string;
  transferred_to_human_at?: string;
  assigned_admin_id?: string;
  created_at: string;
  updated_at: string;
}

interface AIMessage {
  id: string;
  conversation_id: string;
  sender_type: 'user' | 'ai' | 'admin';
  sender_id?: string;
  message_content: string;
  metadata: any;
  created_at: string;
}

export const useAISupport = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<AIConversation | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);

  const createConversation = useCallback(async (sessionId: string) => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_support_conversations')
        .insert({
          user_id: user.id,
          session_id: sessionId,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentConversation(data);
      return data;
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
      toast({
        title: "Erro",
        description: "Erro ao iniciar conversa de suporte",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  const sendMessage = useCallback(async (
    conversationId: string, 
    content: string, 
    senderType: 'user' | 'ai' | 'admin' = 'user'
  ) => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('ai_support_messages')
        .insert({
          conversation_id: conversationId,
          sender_type: senderType,
          sender_id: senderType === 'user' ? user.id : undefined,
          message_content: content,
          metadata: {}
        })
        .select()
        .single();

      if (error) throw error;

      setMessages(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem",
        variant: "destructive",
      });
      return null;
    }
  }, [user?.id, toast]);

  const loadConversations = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_support_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setConversations(data || []);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const loadMessages = useCallback(async (conversationId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_support_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const transferToHuman = useCallback(async (conversationId: string) => {
    try {
      const { error } = await supabase.rpc('transfer_to_human_support', {
        conversation_id: conversationId
      });

      if (error) throw error;

      toast({
        title: "Transferido",
        description: "Conversa transferida para suporte humano",
      });
    } catch (error) {
      console.error('Erro ao transferir para humano:', error);
      toast({
        title: "Erro",
        description: "Erro ao transferir para suporte humano",
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    loading,
    conversations,
    currentConversation,
    messages,
    createConversation,
    sendMessage,
    loadConversations,
    loadMessages,
    transferToHuman,
    setCurrentConversation,
  };
};
