
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Gift } from 'lucide-react';
import { toast } from 'sonner';
import { 
  getSubscriptionPlans, 
  getCurrentSubscription, 
  subscribeToPlan,
  type SubscriptionPlan,
  type UserSubscription 
} from '@/services/subscriptionService';

const SolicitanteSubscriptionPlans: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
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

  const handleSubscribe = async (planId: string) => {
    setSubscribing(planId);
    
    try {
      const success = await subscribeToPlan(planId);
      
      if (success) {
        toast.success('Plano atualizado com sucesso!');
        await loadSubscriptionData();
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
    return <Gift className="h-5 w-5 text-green-500" />;
  };

  const getPlanGradient = (planName: string) => {
    if (planName.includes('Boss')) return 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200';
    if (planName.includes('Medium')) return 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200';
    return 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200';
  };

  const isCurrentPlan = (planId: string) => {
    return currentSubscription?.plan_id === planId;
  };

  const getButtonText = (plan: SubscriptionPlan) => {
    if (subscribing === plan.id) return "Processando...";
    if (isCurrentPlan(plan.id)) return "Plano Atual";
    if (plan.price_monthly === 0) return "Começar Grátis";
    return "Assinar Agora";
  };

  const getPlanBenefits = (planName: string) => {
    if (planName.includes('Boss')) {
      return 'Ideal para empresas e profissionais que precisam de muitos serviços';
    }
    if (planName.includes('Medium')) {
      return 'Perfeito para uso regular e divulgação do seu negócio';
    }
    return 'Ótimo para começar e conhecer a plataforma';
  };

  const formatMaxRequests = (maxRequests: number | null) => {
    if (maxRequests === -1) return "Ilimitadas";
    if (maxRequests === null) return "0";
    return maxRequests.toString();
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
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
          Planos para Solicitantes
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Encontre o plano perfeito para suas necessidades e comece a solicitar serviços hoje mesmo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative transition-all duration-300 ${
              isCurrentPlan(plan.id) 
                ? 'ring-2 ring-helpaqui-blue border-helpaqui-blue shadow-lg scale-105' 
                : 'hover:shadow-lg hover:scale-102'
            } ${getPlanGradient(plan.name)}`}
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

            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center mb-3">
                {getPlanIcon(plan.name)}
                <CardTitle className="ml-2 text-xl font-bold">
                  {plan.name}
                </CardTitle>
              </div>
              
              <div className="text-3xl font-bold text-helpaqui-blue mb-2">
                {plan.price_monthly === 0 ? 'Grátis' : formatPrice(plan.price_monthly)}
                {plan.price_monthly > 0 && (
                  <span className="text-sm font-normal text-gray-500">/mês</span>
                )}
              </div>
              
              <div className="text-sm text-gray-600 mb-2">
                {formatMaxRequests(plan.max_requests_per_month)} solicitações{plan.max_requests_per_month !== -1 ? ' por mês' : ''}
              </div>
              
              <p className="text-sm text-gray-600">
                {getPlanBenefits(plan.name)}
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {(plan.features as string[]).map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full mt-6"
                variant={isCurrentPlan(plan.id) ? "outline" : "default"}
                disabled={isCurrentPlan(plan.id) || subscribing === plan.id}
                onClick={() => handleSubscribe(plan.id)}
              >
                {getButtonText(plan)}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {currentSubscription && (
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-4">Status da Sua Assinatura</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
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
        </div>
      )}
    </div>
  );
};

export default SolicitanteSubscriptionPlans;
