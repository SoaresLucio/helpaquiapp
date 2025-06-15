
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, CreditCard, Home } from 'lucide-react';
import type { UserSubscriptionFlow } from '@/services/subscriptionFlowService';

const SubscriptionSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { subscription } = location.state as {
    subscription: UserSubscriptionFlow;
  };

  useEffect(() => {
    if (!subscription) {
      navigate('/subscription-flow');
    }
  }, [subscription, navigate]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'pix': return 'PIX';
      case 'credit_card': return 'Cartão de Crédito';
      case 'debit_card': return 'Cartão de Débito';
      default: return method;
    }
  };

  if (!subscription) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Assinatura Ativada!
          </h1>
          <p className="text-gray-600">
            Parabéns! Sua assinatura foi processada com sucesso e está ativa.
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Detalhes da Assinatura</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Plano:</span>
                <span className="font-medium">{subscription.plan_name}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Valor:</span>
                <span className="font-bold text-helpaqui-blue text-lg">
                  {formatPrice(subscription.plan_price)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Método de Pagamento:</span>
                <span className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-1" />
                  {getPaymentMethodLabel(subscription.payment_method || '')}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Data de Início:</span>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(subscription.start_date)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Válido até:</span>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(subscription.end_date)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {subscription.status === 'active' ? 'Ativo' : subscription.status}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-3">O que você pode fazer agora:</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                Acessar todos os recursos do seu plano
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                Solicitar serviços de profissionais verificados
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                Acompanhar seu histórico de assinaturas
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                Receber suporte prioritário
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button 
            onClick={() => navigate('/')} 
            className="w-full"
          >
            <Home className="h-4 w-4 mr-2" />
            Ir para Página Inicial
          </Button>
          
          <Button 
            onClick={() => navigate('/subscription-history')} 
            variant="outline"
            className="w-full"
          >
            Ver Histórico de Assinaturas
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;
