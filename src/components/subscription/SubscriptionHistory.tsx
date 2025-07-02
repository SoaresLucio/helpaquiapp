import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Calendar, Crown, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { getCurrentSubscription, cancelSubscription, UserSubscription } from '@/services/subscriptionService';

const SubscriptionHistory: React.FC = () => {
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const subscription = await getCurrentSubscription();
      setCurrentSubscription(subscription);
    } catch (error) {
      console.error('Error loading subscription:', error);
      toast.error('Erro ao carregar assinatura');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setCancelling(true);
      const success = await cancelSubscription();
      
      if (success) {
        toast.success('Assinatura cancelada com sucesso');
        setShowCancelModal(false);
        await loadSubscription();
      } else {
        toast.error('Erro ao cancelar assinatura');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Erro ao cancelar assinatura');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativa</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelada</Badge>;
      case 'expired':
        return <Badge variant="secondary">Expirada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentSubscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Histórico de Assinaturas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Crown className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhuma assinatura ativa
            </h3>
            <p className="text-muted-foreground">
              Você ainda não possui uma assinatura ativa.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const plan = currentSubscription.subscription_plans;
  const isActive = currentSubscription.status === 'active';
  const endDate = currentSubscription.current_period_end 
    ? new Date(currentSubscription.current_period_end)
    : null;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Assinatura Atual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-foreground">
                  {plan?.name || 'Plano Desconhecido'}
                </h3>
                {getStatusBadge(currentSubscription.status || 'unknown')}
              </div>
              
              {plan && (
                <div className="text-2xl font-bold text-primary">
                  {plan.price_monthly === 0 ? (
                    'Gratuito'
                  ) : (
                    <>
                      R$ {plan.price_monthly.toFixed(2).replace('.', ',')}
                      <span className="text-sm font-normal text-muted-foreground">/mês</span>
                    </>
                  )}
                </div>
              )}

              {endDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {isActive ? 'Renovação em: ' : 'Expirou em: '}
                    {endDate.toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
            </div>

            {isActive && plan && plan.price_monthly > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowCancelModal(true)}
                className="text-destructive hover:text-destructive"
              >
                Cancelar Plano
              </Button>
            )}
          </div>

          {plan && plan.features && (
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Benefícios inclusos:</h4>
              <div className="grid gap-2">
                {plan.features.slice(0, 4).map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status da assinatura:</span>
              <span className="font-medium text-foreground">
                {isActive ? 'Ativa e funcionando' : 'Inativa'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de cancelamento */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Cancelar Assinatura
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar sua assinatura do plano{' '}
              <strong>{plan?.name}</strong>?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-orange-800 mb-1">
                    Ao cancelar sua assinatura:
                  </p>
                  <ul className="text-orange-700 space-y-1">
                    <li>• Você perderá acesso aos benefícios premium</li>
                    <li>• O cancelamento será efetivo imediatamente</li>
                    <li>• Você pode reativar a qualquer momento</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCancelModal(false)}
                className="flex-1"
                disabled={cancelling}
              >
                Manter Plano
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelSubscription}
                className="flex-1"
                disabled={cancelling}
              >
                {cancelling ? 'Cancelando...' : 'Sim, Cancelar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SubscriptionHistory;