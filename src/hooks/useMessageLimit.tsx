
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getCurrentSubscription } from '@/services/subscriptionService';

interface MessageLimitInfo {
  canSendMessage: boolean;
  messagesUsed: number;
  messagesLimit: number;
  planName: string;
  isUnlimited: boolean;
}

export const useMessageLimit = () => {
  const { user } = useAuth();
  const [messageLimit, setMessageLimit] = useState<MessageLimitInfo>({
    canSendMessage: true,
    messagesUsed: 0,
    messagesLimit: 6,
    planName: 'Help Bronze',
    isUnlimited: false
  });

  const [loading, setLoading] = useState(true);

  const checkMessageLimit = async (otherUserId?: string) => {
    if (!user?.id) return false;

    try {
      // Buscar plano atual
      const subscription = await getCurrentSubscription();
      const planName = subscription?.subscription_plans?.name || 'Help Bronze';
      const messageLimit = subscription?.subscription_plans?.max_requests_per_month || 6;
      const isUnlimited = messageLimit === -1;

      if (isUnlimited) {
        setMessageLimit({
          canSendMessage: true,
          messagesUsed: 0,
          messagesLimit: -1,
          planName,
          isUnlimited: true
        });
        return true;
      }

      // For now, we'll use a simple approach - count active service requests as a proxy for conversations
      // This can be refined later when we have a proper conversations system
      const { data: requests, error } = await supabase
        .from('service_requests')
        .select('*')
        .eq('client_id', user.id)
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

      if (error) {
        console.error('Erro ao verificar limite de mensagens:', error);
        return false;
      }

      const messagesUsed = requests?.length || 0;
      const canSendMessage = messagesUsed < messageLimit;

      setMessageLimit({
        canSendMessage,
        messagesUsed,
        messagesLimit: messageLimit,
        planName,
        isUnlimited: false
      });

      return canSendMessage;
    } catch (error) {
      console.error('Erro ao verificar limite de mensagens:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const recordConversation = async (otherUserId: string) => {
    if (!user?.id) return;

    try {
      // For now, this is a placeholder since we don't have a conversations system yet
      // In the future, this would insert into a conversations table
      console.log('Recording conversation with user:', otherUserId);
      
      // Update contador local
      await checkMessageLimit();
    } catch (error) {
      console.error('Erro ao registrar conversa:', error);
    }
  };

  const showUpgradeModal = () => {
    const upgradeMessage = messageLimit.planName === 'Help Bronze' 
      ? 'Assine o plano Help Prata ou Ouro para continuar conversando com novos profissionais.'
      : 'Assine o plano Help Ouro para mensagens ilimitadas.';

    toast.error('❌ Limite de mensagens atingido', {
      description: upgradeMessage,
      action: {
        label: 'Ver Planos',
        onClick: () => {
          const userType = localStorage.getItem('userType');
          window.location.href = userType === 'freelancer' ? '/freelancer-plans' : '/solicitante-plans';
        }
      }
    });
  };

  const tryToSendMessage = async (otherUserId: string): Promise<boolean> => {
    const canSend = await checkMessageLimit(otherUserId);
    
    if (!canSend) {
      showUpgradeModal();
      return false;
    }

    await recordConversation(otherUserId);
    return true;
  };

  useEffect(() => {
    if (user?.id) {
      checkMessageLimit();
    }
  }, [user?.id]);

  return {
    messageLimit,
    loading,
    checkMessageLimit,
    tryToSendMessage,
    showUpgradeModal,
    recordConversation
  };
};
