import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import BackButton from '@/components/ui/back-button';
import TermsOfUseDialog from '@/components/TermsOfUseDialog';
import CardPaymentForm from '@/components/subscription/CardPaymentForm';
import { CheckCircle, QrCode, Copy, Loader2, AlertCircle, Clock, CreditCard, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { getSubscriptionPlans, type SubscriptionPlan } from '@/services/subscriptionService';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

type PaymentMethodType = 'select' | 'pix' | 'card';

const PaymentConfirmationPage: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [planData, setPlanData] = useState<SubscriptionPlan | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isTermsDialogOpen, setIsTermsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('select');

  // PIX state from edge function
  const [pixCode, setPixCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [pixExpiry, setPixExpiry] = useState<Date | null>(null);
  const [pixPaymentId, setPixPaymentId] = useState<string | null>(null);
  const [isGeneratingPix, setIsGeneratingPix] = useState(false);
  const [pixError, setPixError] = useState<string | null>(null);

  // Load plan data
  useEffect(() => {
    loadPlanData();
  }, [planId]);

  const loadPlanData = async () => {
    if (!planId) return;

    setLoading(true);
    try {
      const [solicitantePlans, freelancerPlans] = await Promise.all([
        getSubscriptionPlans('solicitante'),
        getSubscriptionPlans('freelancer'),
      ]);

      const allPlans = [...solicitantePlans, ...freelancerPlans];
      const plan = allPlans.find((p) => p.id === planId);

      if (plan) {
        setPlanData(plan);
        // Generate PIX after plan is loaded
        generatePixPayment(plan);
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

  const generatePixPayment = async (plan: SubscriptionPlan) => {
    if (plan.price_monthly <= 0) return;

    setIsGeneratingPix(true);
    setPixError(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-pix-payment', {
        body: {
          planId: plan.id,
          amount: plan.price_monthly,
        },
      });

      if (error) throw new Error(error.message || 'Erro ao gerar PIX');
      if (data?.error) throw new Error(data.error);

      setPixCode(data.pixCode || '');
      setQrCodeUrl(data.qrCodeUrl || '');
      setPixPaymentId(data.pixPaymentId || null);

      if (data.expiresAt) {
        setPixExpiry(new Date(data.expiresAt));
      }
    } catch (error: any) {
      console.error('Error generating PIX:', error);
      setPixError(error.message || 'Erro ao gerar código PIX');
      toast.error('Erro ao gerar código PIX');
    } finally {
      setIsGeneratingPix(false);
    }
  };

  const handleCopyPixCode = async () => {
    if (!pixCode) return;
    try {
      await navigator.clipboard.writeText(pixCode);
      toast.success('Código PIX copiado!');
    } catch {
      toast.error('Erro ao copiar código PIX');
    }
  };

  const handleConfirmPayment = async () => {
    if (!termsAccepted) {
      toast.error('Você deve aceitar os termos de uso para continuar');
      return;
    }

    if (!planData || !pixPaymentId) {
      toast.error('Gere um novo código PIX antes de confirmar');
      return;
    }

    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-subscription-payment', {
        body: {
          pixPaymentId,
          planId: planData.id,
        },
      });

      if (error) throw new Error(error.message || 'Erro ao verificar pagamento');
      if (data?.error) throw new Error(data.error);

      if (data?.isPaid) {
        toast.success('Pagamento confirmado! Assinatura ativada com sucesso!');
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
      } else {
        const message =
          data?.message ||
          'Pagamento não identificado. Aguarde alguns minutos após o pagamento e tente novamente.';
        toast.error(message, { duration: 6000 });
      }
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      toast.error(error.message || 'Erro ao verificar pagamento');
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando dados do plano...</p>
        </div>
      </div>
    );
  }

  if (!planData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Plano não encontrado</h1>
          <BackButton to="/" label="Voltar ao Início" />
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <BackButton to="/" label="Voltar ao Início" />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Confirme sua Assinatura</h1>
          <p className="text-lg text-muted-foreground">
            Revise os detalhes do seu plano e realize o pagamento via PIX
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Plan Details */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground">Resumo do Plano</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center pb-4 border-b border-border">
                <h3 className="text-2xl font-bold text-primary mb-2">{planData.name}</h3>
                <div className="text-3xl font-bold text-foreground">
                  {formatPrice(planData.price_monthly)}
                  <span className="text-sm font-normal text-muted-foreground">/mês</span>
                </div>
                <Badge variant="secondary" className="mt-2">
                  Cobrança mensal
                </Badge>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-4">Benefícios inclusos:</h4>
                <div className="space-y-3">
                  {(planData.features as string[]).map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground">Realize o Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* PIX Section */}
              <div className="text-center space-y-4">
                {isGeneratingPix ? (
                  <div className="py-8 space-y-3">
                    <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Gerando código PIX via ASAAS...</p>
                  </div>
                ) : pixError ? (
                  <div className="py-8 space-y-3">
                    <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
                    <p className="text-sm text-destructive">{pixError}</p>
                    <Button
                      onClick={() => planData && generatePixPayment(planData)}
                      variant="outline"
                      size="sm"
                    >
                      Tentar novamente
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-center">
                      {qrCodeUrl ? (
                        <img
                          src={qrCodeUrl}
                          alt="QR Code PIX"
                          className="h-48 w-48 rounded-lg border"
                        />
                      ) : (
                        <div className="border-2 border-dashed border-border rounded-lg p-8 flex items-center justify-center bg-muted/30">
                          <QrCode className="h-48 w-48 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {pixExpiry && (
                      <div className="flex items-center justify-center gap-2 text-sm text-orange-600">
                        <Clock className="h-4 w-4" />
                        Expira em:{' '}
                        {pixExpiry.toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground font-medium">
                        1. Abra o app do seu banco e escaneie o código
                      </p>
                      <p className="text-sm text-muted-foreground">
                        2. Confirme o pagamento no seu banco
                      </p>
                      <p className="text-sm text-muted-foreground">
                        3. Volte aqui e clique em "Verificar Pagamento"
                      </p>
                    </div>

                    {pixCode && (
                      <div className="space-y-2">
                        <Label htmlFor="pix-code">Código PIX Copia e Cola:</Label>
                        <div className="flex gap-2">
                          <Input
                            id="pix-code"
                            value={pixCode}
                            readOnly
                            className="font-mono text-xs"
                          />
                          <Button onClick={handleCopyPixCode} variant="outline" size="sm">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Terms of Use */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  />
                  <Label
                    htmlFor="terms"
                    className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
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

              {/* Confirm Button */}
              <Button
                onClick={handleConfirmPayment}
                disabled={!termsAccepted || processing || !pixPaymentId || isGeneratingPix}
                className="w-full"
                size="lg"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verificando pagamento...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Já paguei - Verificar Pagamento
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Após efetuar o pagamento via PIX, aguarde alguns segundos e clique no botão acima.
                O sistema verificará automaticamente a confirmação junto ao gateway de pagamento.
              </p>
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
