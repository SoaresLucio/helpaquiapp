
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useMessageLimit = () => {
  const [messageLimit, setMessageLimit] = useState<{
    used: number;
    total: number;
    canSendMessage: boolean;
    loading: boolean;
  }>({
    used: 0,
    total: 0,
    canSendMessage: true,
    loading: true,
  });

  const checkMessageLimit = async (otherUserId?: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        throw new Error('User not authenticated');
      }

      // Buscar plano atual do usuário
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select(`
          messages_used_this_month,
          subscription_plans (
            max_messages_per_month,
            name
          )
        `)
        .eq('user_id', userData.user.id)
        .eq('status', 'active')
        .maybeSingle();

      let maxMessages = 6; // Padrão para plano Bronze
      let usedMessages = 0;

      if (subscription?.subscription_plans) {
        maxMessages = subscription.subscription_plans.max_messages_per_month || 6;
        usedMessages = subscription.messages_used_this_month || 0;
      }

      // Se for ilimitado (-1), sempre pode enviar
      if (maxMessages === -1) {
        setMessageLimit({
          used: usedMessages,
          total: -1,
          canSendMessage: true,
          loading: false,
        });
        return true;
      }

      // Verificar se pode enviar mensagem para usuário específico
      let canSend = true;
      if (otherUserId) {
        const { data: canSendData, error } = await supabase.rpc('check_message_limit', {
          p_user_id: userData.user.id,
          p_other_user_id: otherUserId
        });

        if (error) {
          console.error('Erro ao verificar limite:', error);
          canSend = false;
        } else {
          canSend = canSendData || false;
        }
      }

      setMessageLimit({
        used: usedMessages,
        total: maxMessages,
        canSendMessage: canSend,
        loading: false,
      });

      return canSend;
    } catch (error) {
      console.error('Erro ao verificar limite de mensagens:', error);
      setMessageLimit(prev => ({ ...prev, loading: false }));
      return false;
    }
  };

  const incrementMessageUsage = async (otherUserId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        throw new Error('User not authenticated');
      }

      // Registrar nova conversa
      await supabase
        .from('user_message_tracking')
        .upsert({
          user_id: userData.user.id,
          other_user_id: otherUserId,
        });

      // Atualizar contador de mensagens usadas
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          messages_used_this_month: messageLimit.used + 1
        })
        .eq('user_id', userData.user.id)
        .eq('status', 'active');

      if (error) {
        console.error('Erro ao atualizar contador:', error);
        return false;
      }

      // Atualizar estado local
      setMessageLimit(prev => ({
        ...prev,
        used: prev.used + 1,
        canSendMessage: prev.total === -1 ? true : (prev.used + 1) < prev.total
      }));

      return true;
    } catch (error) {
      console.error('Erro ao incrementar uso de mensagens:', error);
      return false;
    }
  };

  useEffect(() => {
    checkMessageLimit();
  }, []);

  return {
    ...messageLimit,
    checkMessageLimit,
    incrementMessageUsage,
    refreshLimit: checkMessageLimit,
  };
};
