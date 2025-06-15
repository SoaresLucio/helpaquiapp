
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Gift } from 'lucide-react';
import { SubscriptionPlan } from '@/services/subscriptionService';

interface PlanBenefitsCardProps {
  plan: SubscriptionPlan;
  isCurrentPlan: boolean;
  isSubscribing: boolean;
  onSubscribe: (plan: SubscriptionPlan) => void;
}

const PlanBenefitsCard: React.FC<PlanBenefitsCardProps> = ({
  plan,
  isCurrentPlan,
  isSubscribing,
  onSubscribe
}) => {
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

  const getButtonText = () => {
    if (isSubscribing) return "Processando...";
    if (isCurrentPlan) return "Plano Atual";
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

  return (
    <Card 
      className={`relative transition-all duration-300 ${
        isCurrentPlan 
          ? 'ring-2 ring-helpaqui-blue border-helpaqui-blue shadow-lg scale-105' 
          : 'hover:shadow-lg hover:scale-102'
      } ${getPlanGradient(plan.name)}`}
    >
      {isCurrentPlan && (
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
          variant={isCurrentPlan ? "outline" : "default"}
          disabled={isCurrentPlan || isSubscribing}
          onClick={() => onSubscribe(plan)}
        >
          {getButtonText()}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PlanBenefitsCard;
