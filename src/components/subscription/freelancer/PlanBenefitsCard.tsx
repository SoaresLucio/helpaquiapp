
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Crown, Zap, Gift } from 'lucide-react';
import { SubscriptionPlan } from '@/services/subscriptionService';

interface PlanBenefitsCardProps {
  plan: SubscriptionPlan;
  isCurrentPlan: boolean;
  isSubscribing: boolean;
  onSubscribe: (plan: SubscriptionPlan) => void;
}

/**
 * Card individual de plano de assinatura para freelancers
 * Exibe informações detalhadas do plano, benefícios e botão de ação
 * 
 * Características visuais:
 * - Destaque visual para plano atual
 * - Ícones temáticos por tipo de plano
 * - Gradientes de cor diferenciados
 * - Estados de carregamento
 */
const PlanBenefitsCard: React.FC<PlanBenefitsCardProps> = ({
  plan,
  isCurrentPlan,
  isSubscribing,
  onSubscribe
}) => {
  /**
   * Formata valor monetário para Real brasileiro
   */
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  /**
   * Retorna ícone apropriado baseado no nome do plano
   */
  const getPlanIcon = (planName: string) => {
    if (planName.includes('Ouro')) {
      return <Crown className="h-5 w-5 text-yellow-500" />;
    }
    if (planName.includes('Prata')) {
      return <Zap className="h-5 w-5 text-blue-500" />;
    }
    if (planName.includes('Bronze')) {
      return <Gift className="h-5 w-5 text-green-500" />;
    }
    return <Star className="h-5 w-5 text-gray-500" />;
  };

  /**
   * Retorna classes CSS para gradiente do card baseado no plano
   */
  const getPlanGradient = (planName: string) => {
    if (planName.includes('Ouro')) {
      return 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200';
    }
    if (planName.includes('Prata')) {
      return 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200';
    }
    if (planName.includes('Bronze')) {
      return 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200';
    }
    return 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200';
  };

  /**
   * Retorna texto do botão baseado no estado atual
   */
  const getButtonText = () => {
    if (isSubscribing) return "Processando...";
    if (isCurrentPlan) return "Plano Atual";
    if (plan.price_monthly === 0) return "Ativar Grátis";
    return "Assinar Agora";
  };

  /**
   * Retorna descrição promocional do plano
   */
  const getPlanDescription = (planName: string) => {
    if (planName.includes('Ouro')) {
      return 'Ideal para freelancers experientes que querem maximizar oportunidades';
    }
    if (planName.includes('Prata')) {
      return 'Perfeito para profissionais em crescimento que buscam mais visibilidade';
    }
    if (planName.includes('Bronze')) {
      return 'Ótimo para começar e conhecer nossa plataforma';
    }
    return 'Plano básico para iniciantes';
  };

  /**
   * Formata limite de solicitações para exibição
   */
  const formatMaxRequests = (maxRequests: number | null) => {
    if (maxRequests === -1) return "Ilimitadas";
    if (maxRequests === null) return "0";
    return maxRequests.toString();
  };

  /**
   * Formata limite de mensagens para exibição
   */
  const formatMaxMessages = (maxMessages: number | null) => {
    if (maxMessages === -1) return "Ilimitadas";
    if (maxMessages === null) return "0";
    return maxMessages.toString();
  };

  return (
    <Card 
      className={`relative transition-all duration-300 ${
        isCurrentPlan 
          ? 'ring-2 ring-helpaqui-blue border-helpaqui-blue shadow-lg scale-105' 
          : 'hover:shadow-lg hover:scale-102'
      } ${getPlanGradient(plan.name)}`}
    >
      {/* Badge de plano atual */}
      {isCurrentPlan && (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-helpaqui-blue">
          Plano Atual
        </Badge>
      )}
      
      {/* Badge de destaque para planos premium */}
      {plan.name.includes('Ouro') && !isCurrentPlan && (
        <Badge className="absolute -top-2 right-4 bg-yellow-500 text-yellow-900">
          Mais Popular
        </Badge>
      )}

      <CardHeader className="text-center pb-4">
        {/* Ícone e título do plano */}
        <div className="flex items-center justify-center mb-3">
          {getPlanIcon(plan.name)}
          <CardTitle className="ml-2 text-xl font-bold">
            {plan.name}
          </CardTitle>
        </div>
        
        {/* Preço do plano */}
        <div className="text-3xl font-bold text-helpaqui-blue mb-2">
          {plan.price_monthly === 0 ? 'Grátis' : formatPrice(plan.price_monthly)}
          {plan.price_monthly > 0 && (
            <span className="text-sm font-normal text-gray-500">/mês</span>
          )}
        </div>
        
        {/* Limite de solicitações e mensagens */}
        <div className="text-sm text-gray-600 mb-2 space-y-1">
          <div>
            {formatMaxRequests(plan.max_requests_per_month)} oportunidades{plan.max_requests_per_month !== -1 ? ' por mês' : ''}
          </div>
          <div>
            {formatMaxMessages(plan.max_messages_per_month)} conversas{plan.max_messages_per_month !== -1 ? ' por mês' : ''}
          </div>
        </div>
        
        {/* Descrição do plano */}
        <p className="text-sm text-gray-600">
          {getPlanDescription(plan.name)}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Lista de benefícios */}
        <ul className="space-y-3">
          {(plan.features as string[]).map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-4 w-4 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-sm text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>

        {/* Botão de ação */}
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
