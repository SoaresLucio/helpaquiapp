
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  getSubscriptionPlans, 
  getCurrentSubscription,
  type SubscriptionPlan,
  type UserSubscription 
} from '@/services/subscriptionService';
import PlanCard from './PlanCard';
import LoadingState from './LoadingState';
import SubscriptionStatus from './SubscriptionStatus';
import SubscriptionModal from './SubscriptionModal';
import PaymentModal from './PaymentModal';
import SuccessModal from './SuccessModal';
import { useSubscriptionFlow } from '@/hooks/useSubscriptionFlow';

const SubscriptionPlans: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    isSubscriptionModalOpen,
    isPaymentModalOpen,
    isSuccessModalOpen,
    selectedPlan,
    isLoading,
    handleSubscribeClick,
    handleConfirmSubscription,
    handlePaymentSuccess,
    handleGoToDashboard,
    setIsSubscriptionModalOpen,
    setIsPaymentModalOpen,
    setIsSuccessModalOpen
  } = useSubscriptionFlow();

  useEffect(() => {
    const loadData = async () => {
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

    loadData();
  }, []);

  const isCurrentPlan = (planId: string) => {
    return currentSubscription?.plan_id === planId;
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Escolha seu Plano
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Encontre o plano perfeito para suas necessidades e comece a solicitar serviços hoje mesmo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={isCurrentPlan(plan.id)}
              isSubscribing={isLoading}
              onSubscribe={handleSubscribeClick}
            />
          ))}
        </div>

        {currentSubscription && (
          <SubscriptionStatus currentSubscription={currentSubscription} />
        )}
      </div>

      {/* Modals do fluxo de assinatura */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        plan={selectedPlan}
        onConfirm={handleConfirmSubscription}
        isLoading={isLoading}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        plan={selectedPlan}
        onPaymentSuccess={handlePaymentSuccess}
        isLoading={isLoading}
      />

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        plan={selectedPlan}
        onGoToDashboard={handleGoToDashboard}
      />
    </>
  );
};

export default SubscriptionPlans;
