
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Copy, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useSubscriptionFlow } from '@/hooks/useSubscriptionFlow';
import BackButton from '@/components/ui/back-button';
import type { PixPayment, UserSubscriptionFlow } from '@/services/subscriptionFlowService';

const SubscriptionPixPayment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { confirmPixPayment } = useSubscriptionFlow();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);

  // Safely destructure with fallback to null
  const state = location.state as { pixPayment?: PixPayment; subscription?: UserSubscriptionFlow } | null;
  const pixPayment = state?.pixPayment || null;
  const subscription = state?.subscription || null;

  useEffect(() => {
    if (!pixPayment || !subscription) {
      console.error('Missing required data in location.state:', { pixPayment, subscription });
      toast.error('Dados de pagamento não encontrados. Redirecionando...');
      navigate('/subscription-flow');
      return;
    }

    const expirationTime = new Date(pixPayment.expires_at).getTime();
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const timeDiff = expirationTime - now;
      
      if (timeDiff <= 0) {
        setIsExpired(true);
        setTimeLeft(0);
        clearInterval(timer);
      } else {
        setTimeLeft(Math.floor(timeDiff / 1000));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [pixPayment, subscription, navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyPixCode = () => {
    if (!pixPayment) return;
    navigator.clipboard.writeText(pixPayment.pix_code);
    toast.success('Código PIX copiado!');
  };

  const handleConfirmPayment = async () => {
    if (!pixPayment || !subscription) return;
    const result = await confirmPixPayment(pixPayment.id);
    if (result) {
      navigate('/subscription-success', { 
        state: { subscription } 
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  // Show loading or redirect if data is missing
  if (!pixPayment || !subscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Carregando dados do pagamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <BackButton to="/subscription-flow" label="Voltar" />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Pagamento via PIX
          </h1>
          <p className="text-gray-600">
            Escaneie o QR Code ou copie o código PIX para finalizar sua assinatura
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Detalhes do Pagamento</span>
              {!isExpired && (
                <div className="flex items-center text-orange-600">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="font-mono">{formatTime(timeLeft)}</span>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Plano:</span>
              <span>{subscription.plan_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Valor:</span>
              <span className="text-xl font-bold text-helpaqui-blue">
                {formatPrice(pixPayment.amount)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Status:</span>
              <span className={`capitalize ${
                isExpired ? 'text-red-600' : 'text-orange-600'
              }`}>
                {isExpired ? 'Expirado' : 'Aguardando Pagamento'}
              </span>
            </div>
          </CardContent>
        </Card>

        {!isExpired ? (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <QrCode className="h-5 w-5 mr-2" />
                  QR Code PIX
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="bg-white p-8 rounded-lg border-2 border-dashed border-gray-300 mb-4">
                  <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                    <QrCode className="h-24 w-24 text-gray-400" />
                    <span className="sr-only">QR Code para pagamento PIX</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Escaneie este QR Code com o app do seu banco
                </p>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Código PIX</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <code className="text-xs break-all text-gray-700">
                    {pixPayment.pix_code}
                  </code>
                </div>
                <Button onClick={copyPixCode} variant="outline" className="w-full">
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Código PIX
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Após realizar o pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Clique no botão abaixo após confirmar o pagamento no seu banco.
                </p>
                <Button onClick={handleConfirmPayment} className="w-full">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmar Pagamento
                </Button>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <div className="text-red-600 mb-4">
                <Clock className="h-12 w-12 mx-auto mb-2" />
                <h3 className="text-lg font-medium">PIX Expirado</h3>
              </div>
              <p className="text-gray-600 mb-4">
                O código PIX expirou. Você pode gerar um novo código ou escolher outro método de pagamento.
              </p>
              <Button onClick={() => navigate('/subscription-flow')}>
                Voltar para Seleção de Planos
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPixPayment;
