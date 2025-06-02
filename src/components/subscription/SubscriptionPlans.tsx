
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { 
  getSubscriptionPlans, 
  getCurrentSubscription, 
  subscribeToPlan,
  type SubscriptionPlan,
  type UserSubscription 
} from '@/services/subscriptionService';

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
          getSubscriptionPlans(),
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getPlanIcon = (planName: string) => {
    if (planName.includes('Boss')) return <Star className="h-5 w-5 text-yellow-500" />;
    if (planName.includes('Medium')) return <Zap className="h-5 w-5 text-blue-500" />;
    if (planName.includes('Easy')) return <Check className="h-5 w-5 text-green-500" />;
    return null;
  };

  const isCurrentPlan = (planId: string) => {
    return currentSubscription?.plan_id === planId;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative ${
              isCurrentPlan(plan.id) 
                ? 'ring-2 ring-helpaqui-blue border-helpaqui-blue' 
                : 'hover:shadow-lg transition-shadow'
            } ${
              plan.name.includes('Boss') 
                ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200' 
                : ''
            }`}
          >
            {isCurrentPlan(plan.id) && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-helpaqui-blue">
                Plano Atual
              </Badge>
            )}
            
            {plan.name.includes('Boss') && (
              <Badge className="absolute -top-2 right-4 bg-yellow-500 text-yellow-900">
                Mais Popular
              </Badge>
            )}

            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-2">
                {getPlanIcon(plan.name)}
                <CardTitle className="ml-2 text-xl font-bold">
                  {plan.name}
                </CardTitle>
              </div>
              
              <div className="text-3xl font-bold text-helpaqui-blue">
                {formatPrice(plan.price_monthly)}
                <span className="text-sm font-normal text-gray-500">/mês</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {(plan.features as string[]).map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={isCurrentPlan(plan.id) ? "outline" : "default"}
                disabled={isCurrentPlan(plan.id) || subscribing === plan.id}
                onClick={() => handleSubscribe(plan.id)}
              >
                {subscribing === plan.id ? (
                  "Processando..."
                ) : isCurrentPlan(plan.id) ? (
                  "Plano Atual"
                ) : plan.price_monthly === 0 ? (
                  "Começar Grátis"
                ) : (
                  "Assinar Agora"
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {currentSubscription && (
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Status da Assinatura</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div>
              <span className="font-medium">Plano: </span>
              {currentSubscription.subscription_plans?.name}
            </div>
            <div>
              <span className="font-medium">Solicitações usadas: </span>
              {currentSubscription.requests_used_this_month || 0} / {
                currentSubscription.subscription_plans?.max_requests_per_month === -1 
                  ? "Ilimitadas" 
                  : currentSubscription.subscription_plans?.max_requests_per_month
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
      )}
    </div>
  );
};

export default SubscriptionPlans;
