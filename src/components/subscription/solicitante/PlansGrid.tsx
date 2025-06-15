
import React from 'react';
import { SubscriptionPlan } from '@/services/subscriptionService';
import PlanBenefitsCard from './PlanBenefitsCard';

interface PlansGridProps {
  plans: SubscriptionPlan[];
  currentPlanId: string | null;
  subscribingPlanId: string | null;
  onSubscribe: (plan: SubscriptionPlan) => void;
}

const PlansGrid: React.FC<PlansGridProps> = ({
  plans,
  currentPlanId,
  subscribingPlanId,
  onSubscribe
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <PlanBenefitsCard
          key={plan.id}
          plan={plan}
          isCurrentPlan={currentPlanId === plan.id}
          isSubscribing={subscribingPlanId === plan.id}
          onSubscribe={onSubscribe}
        />
      ))}
    </div>
  );
};

export default PlansGrid;
