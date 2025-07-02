import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import BackButton from '@/components/ui/back-button';
import TermsOfUseDialog from '@/components/TermsOfUseDialog';
import { CheckCircle, QrCode, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { getSubscriptionPlans, subscribeToPlan, type SubscriptionPlan } from '@/services/subscriptionService';
import { useAuth } from '@/hooks/useAuth';

const PaymentConfirmationPage: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [planData, setPlanData] = useState<SubscriptionPlan | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isTermsDialogOpen, setIsTermsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [pixCode] = useState('00020126580014BR.GOV.BCB.PIX013654321098-7654-321a-bcde-f0123456789027400014BR.GOV.BCB.PIX2534example.com/qr/v2/99eb3b1ad-4f20-47a0-95e9-3f123');

  // Carregar dados do plano
  useEffect(() => {
    loadPlanData();
  }, [planId]);

  const loadPlanData = async () => {
    if (!planId) return;
    
    setLoading(true);
    try {
      // Buscar ambos os tipos de planos
      const [solicitantePlans, freelancerPlans] = await Promise.all([
        getSubscriptionPlans('solicitante'),
        getSubscriptionPlans('freelancer')
      ]);
      
      const allPlans = [...solicitantePlans, ...freelancerPlans];
      const plan = allPlans.find(p => p.id === planId);
      
      if (plan) {
        setPlanData(plan);
      } else {
        toast.error('Plano não encontrado');
        navigate(-1);
      }
    } catch (error) {
      console.error('Error loading plan data:', error);
      toast.error('Erro ao carregar dados do plano');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPixCode = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      toast.success('Código PIX copiado!');
    } catch (error) {
      toast.error('Erro ao copiar código PIX');
    }
  };

  const handleConfirmPayment = async () => {
    if (!termsAccepted) {
      toast.error('Você deve aceitar os termos de uso para continuar');
      return;
    }

    if (!planData) return;

    setProcessing(true);
    try {
      const success = await subscribeToPlan(planData.id);
      
      if (success) {
        toast.success('Pagamento confirmado! Redirecionando...');
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
      } else {
        toast.error('Erro ao processar pagamento');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Erro ao processar pagamento');
    } finally {
      setProcessing(false);
    }
  };

  const handleAcceptTerms = () => {
    setTermsAccepted(true);
    setIsTermsDialogOpen(false);
    toast.success('Termos aceitos com sucesso!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-helpaqui-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados do plano...</p>
        </div>
      </div>
    );
  }

  if (!planData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Plano não encontrado</h1>
          <BackButton to="/" label="Voltar ao Início" />
        </div>
      </div>
    );
  }

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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Confirme sua Assinatura
          </h1>
          <p className="text-lg text-gray-600">
            Revise os detalhes do seu plano e realize o pagamento via PIX
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Coluna Esquerda - Detalhes do Plano */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">
                Resumo do Plano
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center pb-4 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-primary mb-2">
                  {planData.name}
                </h3>
                <div className="text-3xl font-bold text-gray-900">
                  {formatPrice(planData.price_monthly)}
                  <span className="text-sm font-normal text-gray-600">/mês</span>
                </div>
                <Badge variant="secondary" className="mt-2">
                  Cobrança mensal
                </Badge>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">
                  Benefícios inclusos:
                </h4>
                <div className="space-y-3">
                  {(planData.features as string[]).map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coluna Direita - Confirmação e Pagamento */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">
                Realize o Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Seção PIX */}
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex items-center justify-center bg-gray-50">
                    <QrCode className="h-48 w-48 text-gray-400" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 font-medium">
                    1. Abra o app do seu banco e escaneie o código
                  </p>
                  <p className="text-sm text-gray-600">
                    2. Confirme o pagamento no seu banco
                  </p>
                  <p className="text-sm text-gray-600">
                    3. Volte aqui e clique em "Já realizei o pagamento"
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={handleCopyPixCode}
                  className="w-full"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Código PIX
                </Button>
              </div>

              {/* Termos de Uso */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  />
                  <Label 
                    htmlFor="terms" 
                    className="text-sm text-gray-700 leading-relaxed cursor-pointer"
                  >
                    Eu li e concordo com os{' '}
                    <button
                      type="button"
                      onClick={() => setIsTermsDialogOpen(true)}
                      className="font-semibold text-primary hover:underline"
                    >
                      Termos de Uso do Plano
                    </button>
                  </Label>
                </div>
              </div>

              {/* Botão de Confirmação */}
              <Button
                onClick={handleConfirmPayment}
                disabled={!termsAccepted || processing}
                className="w-full"
                size="lg"
              >
                {processing ? 'Processando...' : 'Já realizei o pagamento'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Terms Dialog */}
      <TermsOfUseDialog
        open={isTermsDialogOpen}
        onOpenChange={setIsTermsDialogOpen}
        onAccept={handleAcceptTerms}
      />
    </div>
  );
};

export default PaymentConfirmationPage;