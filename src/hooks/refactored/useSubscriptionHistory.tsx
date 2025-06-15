
import { useState, useCallback } from 'react';
import { useLoadingState } from '@/hooks/common/useLoadingState';
import { useErrorHandler } from '@/hooks/common/useErrorHandler';
import { getUserSubscriptions, type UserSubscriptionFlow } from '@/services/subscriptionFlowService';

export const useSubscriptionHistory = () => {
  const [subscriptions, setSubscriptions] = useState<UserSubscriptionFlow[]>([]);
  const { loading, withLoading } = useLoadingState();
  const { error, handleError, clearError } = useErrorHandler();

  const loadSubscriptions = useCallback(async () => {
    return withLoading(async () => {
      try {
        clearError();
        console.log('📋 Carregando histórico de assinaturas...');
        
        const { data, error: fetchError } = await getUserSubscriptions();
        
        if (fetchError) {
          handleError(fetchError, 'Erro ao carregar histórico de assinaturas');
          setSubscriptions([]);
          return;
        }

        console.log('✅ Assinaturas carregadas:', data?.length || 0);
        setSubscriptions(data || []);
      } catch (err) {
        handleError(err, 'Erro inesperado ao carregar assinaturas');
        setSubscriptions([]);
      }
    });
  }, [withLoading, handleError, clearError]);

  const refreshSubscriptions = useCallback(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  return {
    subscriptions,
    loading,
    error,
    loadSubscriptions,
    refreshSubscriptions
  };
};
