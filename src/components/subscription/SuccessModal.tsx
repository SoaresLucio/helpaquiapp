import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Crown, Calendar } from 'lucide-react';
import { SubscriptionPlan } from '@/services/subscriptionService';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan | null;
  onGoToDashboard: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  plan,
  onGoToDashboard
}) => {
  if (!plan) return null;

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <Card className="border-0 shadow-none">
          <CardContent className="p-6 text-center space-y-6">
            {/* Ícone de sucesso */}
            <div className="flex justify-center">
              <div className="bg-green-100 rounded-full p-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>

            {/* Título */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                ✅ Assinatura Ativa!
              </h2>
              <p className="text-lg text-muted-foreground">
                Aproveite os benefícios do seu plano{' '}
                <span className="font-semibold text-primary">{plan.name}</span>
              </p>
            </div>

            {/* Detalhes da assinatura */}
            <div className="bg-primary/10 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                <span className="font-semibold text-primary">{plan.name}</span>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Válido até {expiryDate.toLocaleDateString('pt-BR')}
                </span>
              </div>

              {plan.price_monthly > 0 && (
                <div className="text-center">
                  <span className="text-lg font-bold text-primary">
                    R$ {plan.price_monthly.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-sm text-muted-foreground">/mês</span>
                </div>
              )}
            </div>

            {/* Principais benefícios */}
            <div className="text-left space-y-2">
              <h3 className="font-semibold text-foreground text-center">
                Seus novos benefícios:
              </h3>
              <div className="space-y-1">
                {plan.features.slice(0, 3).map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Botões */}
            <div className="space-y-3">
              <Button 
                onClick={onGoToDashboard}
                className="w-full"
                size="lg"
              >
                Ir para o Dashboard
              </Button>
              
              <Button 
                onClick={onClose}
                variant="outline"
                className="w-full"
              >
                Fechar
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessModal;