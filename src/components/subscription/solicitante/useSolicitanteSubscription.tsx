
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { 
  getSubscriptionPlans, 
  getCurrentSubscription, 
  subscribeToPlan,
  cancelSubscription,
  hasActivePaidSubscription,
  type SubscriptionPlan,
  type UserSubscription 
} from '@/services/subscriptionService';

export const useSolicitanteSubscription = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showPlanSummary, setShowPlanSummary] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningPlanName, setWarningPlanName] = useState('');

  const loadSubscriptionData = async () => {
    setLoading(true);
    try {
      const [plansData, currentSub] = await Promise.all([
        getSubscriptionPlans('solicitante'),
        getCurrentSubscription()
      ]);
      
      setPlans(plansData);
      setCurrentSubscription(currentSub);
    } catch (error) {
      console.error('Error loading subscription data:', error);
      toast.error('Erro ao carregar planos de assinatura');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    // Check if it's a free plan
    if (plan.price_monthly === 0) {
      setSubscribing(plan.id);
      
      try {
        const success = await subscribeToPlan(plan.id);
        
        if (success) {
          toast.success('Plano ativado com sucesso!');
          await loadSubscriptionData();
        } else {
          toast.error('Erro ao ativar plano');
        }
      } catch (error) {
        console.error('Error subscribing:', error);
        toast.error('Erro ao processar assinatura');
      } finally {
        setSubscribing(null);
      }
      return;
    }

    // For paid plans, check if user has an active paid subscription
    try {
      const hasActivePaid = await hasActivePaidSubscription();
      
      if (hasActivePaid && currentSubscription?.subscription_plans) {
        setWarningPlanName(plan.name);
        setShowWarningModal(true);
        return;
      }

      // Show plan summary modal for paid plans
      setSelectedPlan(plan);
      setShowPlanSummary(true);
    } catch (error) {
      console.error('Error checking active subscription:', error);
      toast.error('Erro ao verificar assinatura atual');
    }
  };

  const handleConfirmPlan = () => {
    if (selectedPlan) {
      setShowPlanSummary(false);
      navigate('/pix-payment', { state: { plan: selectedPlan } });
    }
  };

  const handleCancelSubscription = async () => {
    setCancelling(true);
    
    try {
      const success = await cancelSubscription();
      
      if (success) {
        toast.success('Assinatura cancelada com sucesso!');
        setShowCancelModal(false);
        await loadSubscriptionData();
      } else {
        toast.error('Erro ao cancelar assinatura');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Erro ao cancelar assinatura');
    } finally {
      setCancelling(false);
    }
  };

  return {
    plans,
    currentSubscription,
    loading,
    subscribing,
    cancelling,
    selectedPlan,
    showPlanSummary,
    showCancelModal,
    showWarningModal,
    warningPlanName,
    handleSubscribe,
    handleConfirmPlan,
    handleCancelSubscription,
    setShowPlanSummary,
    setShowCancelModal,
    setShowWarningModal
  };
};
