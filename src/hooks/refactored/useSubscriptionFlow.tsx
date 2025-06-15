
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { createSubscription } from '@/services/subscriptionFlowService';
import { useLoadingState } from '@/hooks/common/useLoadingState';
import type { SubscriptionPlan } from '@/services/subscriptionService';

export const useSubscriptionFlow = () => {
  const navigate = useNavigate();
  const { loading: isLoading, withLoading } = useLoadingState();

  const subscribe = async (
    plan: SubscriptionPlan, 
    paymentMethod: 'pix' | 'credit_card' | 'debit_card'
  ) => {
    return withLoading(async () => {
      try {
        console.log('🔄 Iniciando processo de assinatura:', { planName: plan.name, paymentMethod });
        
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
      }
    });
  };

  const goToPlans = () => {
    navigate('/subscription');
  };

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
