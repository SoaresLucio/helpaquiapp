
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { createSubscription } from '@/services/subscriptionFlowService';
import type { SubscriptionPlan } from '@/services/subscriptionService';

/**
 * Hook personalizado para gerenciar o fluxo de assinatura
 * Responsável por:
 * - Processar assinaturas de planos
 * - Gerenciar estados de carregamento
 * - Navegar entre páginas do fluxo
 * - Exibir notificações para o usuário
 */
export const useSubscriptionFlow = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Processa a assinatura de um plano específico
   * @param plan - Plano selecionado pelo usuário
   * @param paymentMethod - Método de pagamento escolhido (pix, credit_card, etc.)
   * @returns Objeto com dados da assinatura criada ou erro
   */
  const subscribe = async (
    plan: SubscriptionPlan, 
    paymentMethod: 'pix' | 'credit_card' | 'debit_card'
  ) => {
    setIsLoading(true);
    
    try {
      console.log('🔄 Iniciando processo de assinatura:', { planName: plan.name, paymentMethod });
      
      // Criar assinatura no serviço
      const { data, error } = await createSubscription(
        plan.name,
        plan.price_monthly,
        paymentMethod
      );

      if (error) {
        console.error('❌ Erro ao criar assinatura:', error);
        toast.error('Erro ao processar assinatura. Tente novamente.');
        return { subscription: null, error };
      }

      console.log('✅ Assinatura criada com sucesso:', data);
      toast.success('Assinatura processada com sucesso!');
      
      return { subscription: data, error: null };
    } catch (error) {
      console.error('❌ Erro inesperado:', error);
      toast.error('Erro inesperado. Tente novamente.');
      return { subscription: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Navega para a página de seleção de planos
   */
  const goToPlans = () => {
    navigate('/subscription');
  };

  /**
   * Navega para a página de sucesso da assinatura
   * @param subscriptionData - Dados da assinatura para exibir na página de sucesso
   */
  const goToSuccess = (subscriptionData: any) => {
    navigate('/subscription-success', { 
      state: { subscription: subscriptionData } 
    });
  };

  return {
    subscribe,
    goToPlans,
    goToSuccess,
    isLoading
  };
};
