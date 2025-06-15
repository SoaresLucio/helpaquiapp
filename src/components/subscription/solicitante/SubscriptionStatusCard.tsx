
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { UserSubscription } from '@/services/subscriptionService';

interface SubscriptionStatusCardProps {
  currentSubscription: UserSubscription;
  onCancelClick: () => void;
}

const SubscriptionStatusCard: React.FC<SubscriptionStatusCardProps> = ({
  currentSubscription,
  onCancelClick
}) => {
  const formatMaxRequests = (maxRequests: number | null) => {
    if (maxRequests === -1) return "Ilimitadas";
    if (maxRequests === null) return "0";
    return maxRequests.toString();
  };

  return (
    <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="font-semibold text-blue-900 mb-4">Status da Sua Assinatura</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800 mb-4">
        <div className="flex flex-col">
          <span className="font-medium mb-1">Plano Atual:</span>
          <span>{currentSubscription.subscription_plans?.name}</span>
        </div>
        <div className="flex flex-col">
          <span className="font-medium mb-1">Solicitações utilizadas:</span>
          <span>
            {currentSubscription.requests_used_this_month || 0} / {
              formatMaxRequests(currentSubscription.subscription_plans?.max_requests_per_month || null)
            }
          </span>
        </div>
        <div className="flex flex-col">
          <span className="font-medium mb-1">Status:</span>
          <Badge variant={currentSubscription.status === 'active' ? 'default' : 'secondary'}>
            {currentSubscription.status === 'active' ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </div>
      
      {currentSubscription.subscription_plans?.price_monthly && currentSubscription.subscription_plans.price_monthly > 0 && (
        <div className="pt-4 border-t border-blue-200">
          <Button
            variant="outline"
            onClick={onCancelClick}
            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar Assinatura
          </Button>
        </div>
      )}
    </div>
  );
};

export default SubscriptionStatusCard;
