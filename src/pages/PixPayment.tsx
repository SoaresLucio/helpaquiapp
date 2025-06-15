
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, QrCode, ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useSubscriptionFlow } from '@/hooks/useSubscriptionFlow';
import type { SubscriptionPlan } from '@/services/subscriptionService';

const PixPayment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { subscribe } = useSubscriptionFlow();
  
  const state = location.state as { plan?: SubscriptionPlan } | null;
  const plan = state?.plan;
  
  const [pixCode, setPixCode] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'confirmed'>('pending');
  const [timeLeft, setTimeLeft] = useState<number>(30 * 60); // 30 minutos em segundos

  useEffect(() => {
    if (!plan) {
      toast.error('Plano não encontrado. Redirecionando...');
      navigate('/subscription');
      return;
    }

    // Gerar código PIX simulado
    generatePixCode();
  }, [plan, navigate]);

  useEffect(() => {
    // Contador regressivo
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.error('Código PIX expirado. Gerando novo código...');
          generatePixCode();
          return 30 * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [pixCode]);

  const generatePixCode = () => {
    const amount = plan?.price_monthly || 0;
    // Simular código PIX (em produção, seria integrado com API do banco)
    const simulatedPixCode = `00020126580014BR.GOV.BCB.PIX0136${Math.random().toString(36).substring(2, 15)}52040000530398654${amount.toFixed(2).replace('.', '')}5802BR5909HELPAQUI6008BRASILIA62070503***6304`;
    setPixCode(simulatedPixCode);
    setPaymentStatus('pending');
  };

  const copyPixCode = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      toast.success('Código PIX copiado para a área de transferência!');
    } catch (error) {
      toast.error('Erro ao copiar código PIX');
    }
  };

  const confirmPayment = async () => {
    if (!plan) return;

    setPaymentStatus('processing');
    
    try {
      const result = await subscribe(plan, 'pix');
      
      if (result.subscription) {
        setPaymentStatus('confirmed');
        toast.success('Pagamento confirmado com sucesso!');
        
        // Redirecionar para página de sucesso após 2 segundos
        setTimeout(() => {
          navigate('/subscription-success', {
            state: { subscription: result.subscription }
          });
        }, 2000);
      } else {
        throw new Error('Erro ao processar assinatura');
      }
    } catch (error) {
      setPaymentStatus('pending');
      toast.error('Erro ao confirmar pagamento. Tente novamente.');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'confirmed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Pagamento Confirmado!
            </h2>
            <p className="text-gray-600 mb-4">
              Redirecionando para a página de sucesso...
            </p>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Pagamento via PIX
          </h1>
          <p className="text-gray-600">
            Finalize sua assinatura do plano {plan.name}
          </p>
        </div>

        {/* Resumo do Pedido */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Resumo do Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{plan.name}</p>
                <p className="text-sm text-gray-600">Assinatura mensal</p>
              </div>
              <p className="text-xl font-bold text-helpaqui-blue">
                {formatPrice(plan.price_monthly)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Código PIX */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <QrCode className="h-5 w-5 mr-2" />
              Código PIX
              <div className="ml-auto flex items-center text-sm text-orange-600">
                <Clock className="h-4 w-4 mr-1" />
                {formatTime(timeLeft)}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-xs break-all font-mono">{pixCode}</p>
            </div>
            
            <Button
              onClick={copyPixCode}
              variant="outline"
              className="w-full"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar código PIX
            </Button>

            <div className="text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <QrCode className="h-16 w-16 text-gray-400" />
                <span className="sr-only">QR Code do PIX</span>
              </div>
              <p className="text-sm text-gray-600">
                Escaneie o QR Code ou copie o código PIX
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Instruções */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Como pagar:</h3>
            <ol className="space-y-2 text-sm text-gray-600">
              <li>1. Abra o app do seu banco</li>
              <li>2. Escolha a opção PIX</li>
              <li>3. Escaneie o QR Code ou cole o código copiado</li>
              <li>4. Confirme o pagamento no seu banco</li>
              <li>5. Clique em "Já paguei" abaixo</li>
            </ol>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="space-y-3">
          <Button
            onClick={confirmPayment}
            disabled={paymentStatus === 'processing'}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {paymentStatus === 'processing' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processando...
              </>
            ) : (
              'Já paguei'
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate('/subscription')}
            className="w-full"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PixPayment;
