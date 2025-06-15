
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, X } from 'lucide-react';
import { SubscriptionPlan } from '@/services/subscriptionService';

interface PlanSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan | null;
  onConfirm: () => void;
}

const PlanSummaryModal: React.FC<PlanSummaryModalProps> = ({
  isOpen,
  onClose,
  plan,
  onConfirm
}) => {
  if (!plan) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatMaxRequests = (maxRequests: number | null) => {
    if (maxRequests === -1) return "Ilimitadas";
    if (maxRequests === null) return "0";
    return maxRequests.toString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            Resumo do Plano
          </DialogTitle>
        </DialogHeader>
        
        <Card className="border-2 border-helpaqui-blue">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-helpaqui-blue mb-2">
                {plan.name}
              </h3>
              <div className="text-2xl font-bold text-helpaqui-blue">
                {plan.price_monthly === 0 ? 'Grátis' : formatPrice(plan.price_monthly)}
                {plan.price_monthly > 0 && (
                  <span className="text-sm font-normal text-gray-500">/mês</span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {formatMaxRequests(plan.max_requests_per_month)} solicitações{plan.max_requests_per_month !== -1 ? ' por mês' : ''}
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <h4 className="font-semibold text-gray-900">Benefícios inclusos:</h4>
              <ul className="space-y-2">
                {(plan.features as string[]).map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="flex space-x-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            Confirmar e Prosseguir para o pagamento
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlanSummaryModal;
