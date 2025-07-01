
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

export const useFreelancerSubscription = () => {
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
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successPlanName, setSuccessPlanName] = useState('');

  const loadSubscriptionData = async () => {
    setLoading(true);
    console.log('🔄 Carregando dados de assinatura para freelancer...');
    
    try {
      const [plansData, currentSub] = await Promise.all([
        getSubscriptionPlans('freelancer'),
        getCurrentSubscription()
      ]);
      
      console.log('✅ Dados carregados:', { 
        plansCount: plansData.length, 
        hasSubscription: !!currentSub 
      });
      
      setPlans(plansData);
      setCurrentSubscription(currentSub);
    } catch (error) {
      console.error('❌ Erro ao carregar dados de assinatura:', error);
      toast.error('Erro ao carregar planos de assinatura');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    console.log('🎯 Iniciando processo de assinatura:', plan.name);
    
    if (plan.price_monthly === 0) {
      setSubscribing(plan.id);
      
      try {
        const success = await subscribeToPlan(plan.id);
        
        if (success) {
          setSuccessPlanName(plan.name);
          setShowSuccessMessage(true);
          await loadSubscriptionData();
        } else {
          toast.error('Erro ao ativar plano');
        }
      } catch (error) {
        console.error('❌ Erro ao ativar plano:', error);
        toast.error('Erro ao processar assinatura');
      } finally {
        setSubscribing(null);
      }
      return;
    }

    try {
      const hasActivePaid = await hasActivePaidSubscription();
      
      if (hasActivePaid && currentSubscription?.subscription_plans) {
        setWarningPlanName(plan.name);
        setShowWarningModal(true);
        return;
      }

      setSelectedPlan(plan);
      setShowPlanSummary(true);
    } catch (error) {
      console.error('❌ Erro ao verificar assinatura ativa:', error);
      toast.error('Erro ao verificar assinatura atual');
    }
  };

  const handleConfirmPlan = () => {
    if (selectedPlan) {
      console.log('✅ Confirmando plano e redirecionando para pagamento:', selectedPlan.name);
      setShowPlanSummary(false);
      navigate('/pix-payment', { state: { plan: selectedPlan } });
    }
  };

  const handleCancelSubscription = async () => {
    setCancelling(true);
    console.log('🚫 Cancelando assinatura...');
    
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
      console.error('❌ Erro ao cancelar assinatura:', error);
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
    showSuccessMessage,
    successPlanName,
    
    handleSubscribe,
    handleConfirmPlan,
    handleCancelSubscription,
    
    setShowPlanSummary,
    setShowCancelModal,
    setShowWarningModal,
    setShowSuccessMessage
  };
};
