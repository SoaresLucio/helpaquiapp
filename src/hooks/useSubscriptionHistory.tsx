
import { useState, useCallback } from 'react';
import { getUserSubscriptions, type UserSubscriptionFlow } from '@/services/subscriptionFlowService';

/**
 * Hook personalizado para gerenciar o histórico de assinaturas
 * Responsável por:
 * - Carregar histórico de assinaturas do usuário
 * - Gerenciar estados de carregamento
 * - Recarregar dados quando necessário
 */
export const useSubscriptionHistory = () => {
  const [subscriptions, setSubscriptions] = useState<UserSubscriptionFlow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carrega o histórico de assinaturas do usuário
   */
  const loadSubscriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📋 Carregando histórico de assinaturas...');
      
      const { data, error: fetchError } = await getUserSubscriptions();
      
      if (fetchError) {
        console.error('❌ Erro ao carregar assinaturas:', fetchError);
        setError('Erro ao carregar histórico de assinaturas');
        setSubscriptions([]);
        return;
      }

      console.log('✅ Assinaturas carregadas:', data?.length || 0);
      setSubscriptions(data || []);
    } catch (err) {
      console.error('❌ Erro inesperado:', err);
      setError('Erro inesperado ao carregar assinaturas');
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Recarrega o histórico de assinaturas
   */
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
