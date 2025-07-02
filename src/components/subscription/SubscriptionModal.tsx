import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown } from 'lucide-react';
import { SubscriptionPlan } from '@/services/subscriptionService';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  plan,
  onConfirm,
  isLoading = false
}) => {
  if (!plan) return null;

  const isFreePlan = plan.price_monthly === 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-foreground">
            Confirmar Assinatura
          </DialogTitle>
        </DialogHeader>
        
        <Card className="border-2 border-primary/20">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Crown className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
              </div>
              
              <div className="text-3xl font-bold text-primary mb-2">
                {isFreePlan ? (
                  'Gratuito'
                ) : (
                  <>
                    R$ {plan.price_monthly.toFixed(2).replace('.', ',')}
                    <span className="text-sm font-normal text-muted-foreground">/mês</span>
                  </>
                )}
              </div>
              
              {!isFreePlan && (
                <Badge variant="secondary" className="mb-4">
                  Cobrança mensal
                </Badge>
              )}
            </div>

            <div className="space-y-3 mb-6">
              <h4 className="font-semibold text-foreground">Benefícios inclusos:</h4>
              <div className="space-y-2">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {plan.priority_support && (
              <div className="bg-primary/10 p-3 rounded-lg mb-6">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Suporte Prioritário Incluído</span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Button 
                onClick={onConfirm}
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? 'Processando...' : isFreePlan ? 'Ativar Plano Gratuito' : 'Confirmar e Prosseguir para Pagamento'}
              </Button>
              
              <Button 
                onClick={onClose}
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionModal;