import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  SubscriptionPlan, 
  getCurrentSubscription, 
  subscribeToPlan 
} from '@/services/subscriptionService';

export const useSubscriptionFlow = () => {
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribeClick = useCallback(async (plan: SubscriptionPlan) => {
    try {
      setIsLoading(true);
      
      // Check if user already has an active subscription
      const currentSub = await getCurrentSubscription();
      
      if (currentSub && currentSub.status === 'active') {
        toast.error(
          'Você já possui um plano ativo. Cancele sua assinatura atual antes de assinar um novo plano.',
          { duration: 5000 }
        );
        return;
      }

      setSelectedPlan(plan);
      setIsSubscriptionModalOpen(true);
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast.error('Erro ao verificar assinatura atual');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleConfirmSubscription = useCallback(async () => {
    if (!selectedPlan) return;

    try {
      setIsLoading(true);
      
      // Free plan: activate directly
      if (selectedPlan.price_monthly === 0) {
        const success = await subscribeToPlan(selectedPlan.id);
        
        if (success) {
          setIsSubscriptionModalOpen(false);
          setIsSuccessModalOpen(true);
          toast.success('Plano ativado com sucesso!');
        } else {
          toast.error('Erro ao ativar plano');
        }
      } else {
        // Paid plans: go to payment modal (PIX via ASAAS)
        setIsSubscriptionModalOpen(false);
        setIsPaymentModalOpen(true);
      }
    } catch (error) {
      console.error('Error confirming subscription:', error);
      toast.error('Erro ao processar assinatura');
    } finally {
      setIsLoading(false);
    }
  }, [selectedPlan]);

  // Called after payment is verified by the edge function
  // Subscription is already activated by verify-subscription-payment edge function
  const handlePaymentSuccess = useCallback(() => {
    setIsPaymentModalOpen(false);
    setIsSuccessModalOpen(true);
    // No need to call subscribeToPlan - the edge function already activated it
  }, []);

  const handleGoToDashboard = useCallback(() => {
    setIsSuccessModalOpen(false);
    setSelectedPlan(null);
    // Reload page to reflect changes
    window.location.reload();
  }, []);

  const closeAllModals = useCallback(() => {
    setIsSubscriptionModalOpen(false);
    setIsPaymentModalOpen(false);
    setIsSuccessModalOpen(false);
    setSelectedPlan(null);
  }, []);

  return {
    // State
    isSubscriptionModalOpen,
    isPaymentModalOpen,
    isSuccessModalOpen,
    selectedPlan,
    isLoading,
    
    // Actions
    handleSubscribeClick,
    handleConfirmSubscription,
    handlePaymentSuccess,
    handleGoToDashboard,
    closeAllModals,
    
    // Modal controls
    setIsSubscriptionModalOpen,
    setIsPaymentModalOpen,
    setIsSuccessModalOpen
  };
};

export default useSubscriptionFlow;
