
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  getSubscriptionPlans, 
  getCurrentSubscription, 
  subscribeToPlan,
  type SubscriptionPlan,
  type UserSubscription 
} from '@/services/subscriptionService';
import PlanCard from './PlanCard';
import LoadingState from './LoadingState';
import SubscriptionStatus from './SubscriptionStatus';

const SubscriptionPlans: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);

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

  const handleSubscribe = async (planId: string) => {
    setSubscribing(planId);
    
    try {
      const success = await subscribeToPlan(planId);
      
      if (success) {
        toast.success('Plano atualizado com sucesso!');
        // Reload current subscription
        const updatedSub = await getCurrentSubscription();
        setCurrentSubscription(updatedSub);
      } else {
        toast.error('Erro ao atualizar plano');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      toast.error('Erro ao processar assinatura');
    } finally {
      setSubscribing(null);
    }
  };

  const isCurrentPlan = (planId: string) => {
    return currentSubscription?.plan_id === planId;
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
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
            isSubscribing={subscribing === plan.id}
            onSubscribe={handleSubscribe}
          />
        ))}
      </div>

      {currentSubscription && (
        <SubscriptionStatus currentSubscription={currentSubscription} />
      )}
    </div>
  );
};

export default SubscriptionPlans;
