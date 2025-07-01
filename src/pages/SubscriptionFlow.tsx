
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, CreditCard, QrCode, ArrowLeft } from 'lucide-react';
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from '@/services/subscriptionFlowService';
import { useSubscriptionFlow } from '@/hooks/useSubscriptionFlow';
import BackButton from '@/components/ui/back-button';

const SubscriptionFlow: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card' | 'debit_card' | null>(null);
  const { subscribe, loading } = useSubscriptionFlow();

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
  };

  const handlePaymentMethodSelect = (method: 'pix' | 'credit_card' | 'debit_card') => {
    setPaymentMethod(method);
  };

  const handleSubscribe = async () => {
    if (!selectedPlan || !paymentMethod) return;

    const result = await subscribe(selectedPlan, paymentMethod);
    
    if (result.subscription) {
      if (paymentMethod === 'pix' && result.pixPayment) {
        navigate('/subscription-pix-payment', { 
          state: { 
            pixPayment: result.pixPayment,
            subscription: result.subscription 
          } 
        });
      } else {
        navigate('/subscription-success', { 
          state: { subscription: result.subscription } 
        });
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <BackButton to="/" label="Voltar ao Início" />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Escolha seu Plano de Assinatura
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Selecione o plano que melhor atende às suas necessidades e comece a usar todos os recursos da plataforma.
          </p>
        </div>

        {!selectedPlan ? (
          // Seleção de Plano
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <Card 
                key={plan.id}
                className={`relative transition-all duration-300 cursor-pointer hover:shadow-lg ${
                  plan.popular ? 'ring-2 ring-helpaqui-blue border-helpaqui-blue' : ''
                }`}
                onClick={() => handlePlanSelect(plan)}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-helpaqui-blue">
                    <Star className="h-3 w-3 mr-1" />
                    Mais Popular
                  </Badge>
                )}

                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl font-bold mb-2">
                    {plan.name}
                  </CardTitle>
                  <div className="text-3xl font-bold text-helpaqui-blue mb-2">
                    {formatPrice(plan.price)}
                    <span className="text-sm font-normal text-gray-500">/mês</span>
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                    Selecionar Plano
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !paymentMethod ? (
          // Seleção de Método de Pagamento
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
              <Button
                variant="ghost"
                onClick={() => setSelectedPlan(null)}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Plano Selecionado: {selectedPlan.name}
                </h2>
                <p className="text-gray-600">
                  {formatPrice(selectedPlan.price)}/mês
                </p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Escolha a forma de pagamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full h-16 text-left justify-start"
                  onClick={() => handlePaymentMethodSelect('pix')}
                >
                  <QrCode className="h-6 w-6 mr-4 text-green-600" />
                  <div>
                    <div className="font-medium">PIX</div>
                    <div className="text-sm text-gray-500">Pagamento instantâneo</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-16 text-left justify-start"
                  onClick={() => handlePaymentMethodSelect('credit_card')}
                >
                  <CreditCard className="h-6 w-6 mr-4 text-blue-600" />
                  <div>
                    <div className="font-medium">Cartão de Crédito</div>
                    <div className="text-sm text-gray-500">Parcelamento disponível</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-16 text-left justify-start"
                  onClick={() => handlePaymentMethodSelect('debit_card')}
                >
                  <CreditCard className="h-6 w-6 mr-4 text-purple-600" />
                  <div>
                    <div className="font-medium">Cartão de Débito</div>
                    <div className="text-sm text-gray-500">Débito à vista</div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Confirmação
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
              <Button
                variant="ghost"
                onClick={() => setPaymentMethod(null)}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <h2 className="text-2xl font-bold text-gray-900">
                Confirmar Assinatura
              </h2>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Resumo da Assinatura</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Plano:</span>
                  <span>{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Valor:</span>
                  <span className="text-xl font-bold text-helpaqui-blue">
                    {formatPrice(selectedPlan.price)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Método de Pagamento:</span>
                  <span className="capitalize">
                    {paymentMethod === 'pix' ? 'PIX' : 
                     paymentMethod === 'credit_card' ? 'Cartão de Crédito' : 
                     'Cartão de Débito'}
                  </span>
                </div>
                
                <div className="border-t pt-4">
                  <Button 
                    className="w-full" 
                    onClick={handleSubscribe}
                    disabled={loading}
                  >
                    {loading ? 'Processando...' : 'Confirmar Assinatura'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionFlow;
