
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { UserSubscription } from '@/services/subscriptionService';

interface SubscriptionStatusProps {
  currentSubscription: UserSubscription;
}

const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ currentSubscription }) => {
  const formatMaxRequests = (maxRequests: number | null) => {
    if (maxRequests === -1) return "Ilimitadas";
    if (maxRequests === null) return "0";
    return maxRequests.toString();
  };

  return (
    <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="font-semibold text-blue-900 mb-4">Status da Assinatura</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
        <div>
          <span className="font-medium">Plano: </span>
          {currentSubscription.subscription_plans?.name}
        </div>
        <div>
          <span className="font-medium">Solicitações usadas: </span>
          {currentSubscription.requests_used_this_month || 0} / {
            formatMaxRequests(currentSubscription.subscription_plans?.max_requests_per_month || null)
          }
        </div>
        <div>
          <span className="font-medium">Status: </span>
          <Badge variant={currentSubscription.status === 'active' ? 'default' : 'secondary'}>
            {currentSubscription.status === 'active' ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionStatus;
