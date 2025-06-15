
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

/**
 * Hook personalizado para gerenciar assinaturas de freelancers
 * 
 * Funcionalidades:
 * - Carrega planos disponíveis para freelancers
 * - Gerencia assinatura atual
 * - Processa novas assinaturas
 * - Controla modais de confirmação
 * - Gerencia cancelamentos
 */
export const useFreelancerSubscription = () => {
  const navigate = useNavigate();
  
  // Estados principais
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados de operação
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  
  // Estados de modais
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showPlanSummary, setShowPlanSummary] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningPlanName, setWarningPlanName] = useState('');

  /**
   * Carrega dados de assinatura (planos e assinatura atual)
   */
  const loadSubscriptionData = async () => {
    setLoading(true);
    console.log('🔄 Carregando dados de assinatura para freelancer...');
    
    try {
      // Busca planos e assinatura atual em paralelo
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

  // Carrega dados na inicialização
  useEffect(() => {
    loadSubscriptionData();
  }, []);

  /**
   * Processa assinatura de um plano
   * @param plan - Plano selecionado pelo freelancer
   */
  const handleSubscribe = async (plan: SubscriptionPlan) => {
    console.log('🎯 Iniciando processo de assinatura:', plan.name);
    
    // Planos gratuitos são ativados imediatamente
    if (plan.price_monthly === 0) {
      setSubscribing(plan.id);
      
      try {
        const success = await subscribeToPlan(plan.id);
        
        if (success) {
          toast.success('Plano ativado com sucesso!');
          await loadSubscriptionData(); // Recarrega dados
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

    // Para planos pagos, verifica se já há assinatura ativa
    try {
      const hasActivePaid = await hasActivePaidSubscription();
      
      if (hasActivePaid && currentSubscription?.subscription_plans) {
        setWarningPlanName(plan.name);
        setShowWarningModal(true);
        return;
      }

      // Exibe modal de resumo para planos pagos
      setSelectedPlan(plan);
      setShowPlanSummary(true);
    } catch (error) {
      console.error('❌ Erro ao verificar assinatura ativa:', error);
      toast.error('Erro ao verificar assinatura atual');
    }
  };

  /**
   * Confirma assinatura de plano pago e redireciona para pagamento
   */
  const handleConfirmPlan = () => {
    if (selectedPlan) {
      console.log('✅ Confirmando plano e redirecionando para pagamento:', selectedPlan.name);
      setShowPlanSummary(false);
      
      // Redireciona para página de pagamento PIX
      navigate('/pix-payment', { state: { plan: selectedPlan } });
    }
  };

  /**
   * Processa cancelamento da assinatura atual
   */
  const handleCancelSubscription = async () => {
    setCancelling(true);
    console.log('🚫 Cancelando assinatura...');
    
    try {
      const success = await cancelSubscription();
      
      if (success) {
        toast.success('Assinatura cancelada com sucesso!');
        setShowCancelModal(false);
        await loadSubscriptionData(); // Recarrega dados
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
    // Dados
    plans,
    currentSubscription,
    loading,
    
    // Estados de operação
    subscribing,
    cancelling,
    
    // Estados de modais
    selectedPlan,
    showPlanSummary,
    showCancelModal,
    showWarningModal,
    warningPlanName,
    
    // Ações
    handleSubscribe,
    handleConfirmPlan,
    handleCancelSubscription,
    
    // Controles de modal
    setShowPlanSummary,
    setShowCancelModal,
    setShowWarningModal
  };
};
