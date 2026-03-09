import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, QrCode, Clock, CheckCircle2, Loader2, AlertCircle, CreditCard, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { SubscriptionPlan } from '@/services/subscriptionService';
import { supabase } from '@/integrations/supabase/client';
import CardPaymentForm from './CardPaymentForm';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan | null;
  onPaymentSuccess: () => void;
  isLoading?: boolean;
}

type PaymentMethod = 'select' | 'pix' | 'card';

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  plan,
  onPaymentSuccess,
  isLoading = false
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('select');
  const [pixCode, setPixCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [pixExpiry, setPixExpiry] = useState<Date | null>(null);
  const [pixPaymentId, setPixPaymentId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [pixCpf, setPixCpf] = useState('');
  const [needsCpf, setNeedsCpf] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPaymentMethod('select');
      setPixCode('');
      setQrCodeUrl('');
      setPixExpiry(null);
      setPixPaymentId(null);
      setGenerateError(null);
      setPixCpf('');
      setNeedsCpf(false);
    }
  }, [isOpen]);

  const generateRealPixCode = async (cpfInput?: string) => {
    if (!plan) return;
    setIsGenerating(true);
    setGenerateError(null);
    setNeedsCpf(false);

    try {
      const requestBody: Record<string, unknown> = { 
        planId: plan.id, 
        amount: plan.price_monthly 
      };
      if (cpfInput) {
        requestBody.cpf = cpfInput.replace(/\D/g, '');
      }

      const { data, error } = await supabase.functions.invoke('generate-pix-payment', {
        body: requestBody,
      });
      
      // Handle error from edge function - extract message from various possible locations
      let errorMessage = '';
      if (error) {
        // Try to get message from error context (response body) or error message
        const contextData = (error as any)?.context;
        if (contextData?.error) {
          errorMessage = contextData.error;
        } else if (typeof contextData === 'string') {
          try {
            const parsed = JSON.parse(contextData);
            errorMessage = parsed.error || error.message;
          } catch {
            errorMessage = error.message || 'Erro ao gerar PIX';
          }
        } else {
          errorMessage = error.message || 'Erro ao gerar PIX';
        }
      }
      if (data?.error) {
        errorMessage = data.error;
      }
      
      if (errorMessage) {
        throw new Error(errorMessage);
      }

      setPixCode(data.pixCode || '');
      setQrCodeUrl(data.qrCodeUrl || '');
      setPixPaymentId(data.pixPaymentId || null);
      setNeedsCpf(false);
      if (data.expiresAt) setPixExpiry(new Date(data.expiresAt));
    } catch (error: any) {
      console.error('Error generating PIX:', error);
      const errorMessage = error.message || 'Erro ao gerar código PIX.';
      setGenerateError(errorMessage);
      if (errorMessage.toLowerCase().includes('cpf')) {
        setNeedsCpf(true);
      }
      toast.error('Erro ao gerar código PIX');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectPix = () => {
    setPaymentMethod('pix');
    generateRealPixCode();
  };

  const copyPixCode = () => {
    if (!pixCode) return;
    navigator.clipboard.writeText(pixCode);
    toast.success('Código PIX copiado!');
  };

  const handleVerifyPayment = async () => {
    if (!pixPaymentId || !plan) { toast.error('Gere um novo código PIX'); return; }
    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-subscription-payment', {
        body: { pixPaymentId, planId: plan.id },
      });
      if (error) throw new Error(error.message || 'Erro ao verificar pagamento');
      if (data?.error) throw new Error(data.error);

      if (data?.isPaid) {
        toast.success('Pagamento confirmado! Assinatura ativada.');
        onPaymentSuccess();
      } else {
        toast.error(data?.message || 'Pagamento não identificado. Aguarde e tente novamente.', { duration: 6000 });
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao verificar pagamento');
    } finally {
      setIsVerifying(false);
    }
  };

  if (!plan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-foreground">
            Finalizar Pagamento
          </DialogTitle>
        </DialogHeader>

        {/* Plan summary */}
        <Card className="border border-primary/20 mb-4">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-foreground">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">Assinatura mensal</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-primary">
                  R$ {plan.price_monthly.toFixed(2).replace('.', ',')}
                </div>
                <Badge variant="secondary" className="text-xs">/mês</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment method selection */}
        {paymentMethod === 'select' && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">Escolha o método de pagamento:</p>
            <Button
              onClick={handleSelectPix}
              variant="outline"
              className="w-full h-16 flex items-center justify-start gap-4 px-4"
            >
              <div className="bg-primary/10 p-2 rounded-lg">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-foreground">PIX</div>
                <div className="text-xs text-muted-foreground">Pagamento único via QR Code</div>
              </div>
            </Button>
            <Button
              onClick={() => setPaymentMethod('card')}
              variant="outline"
              className="w-full h-16 flex items-center justify-start gap-4 px-4"
            >
              <div className="bg-primary/10 p-2 rounded-lg">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-foreground">Cartão de Crédito/Débito</div>
                <div className="text-xs text-muted-foreground">Cobrança mensal automática</div>
              </div>
            </Button>
            <Button onClick={onClose} variant="ghost" className="w-full" disabled={isLoading}>
              Cancelar
            </Button>
          </div>
        )}

        {/* PIX Payment */}
        {paymentMethod === 'pix' && (
          <Card>
            <CardContent className="p-4">
              <div className="text-center space-y-4">
                {isGenerating ? (
                  <div className="py-8 space-y-3">
                    <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Gerando código PIX...</p>
                  </div>
                ) : generateError ? (
                  <div className="py-4 space-y-4">
                    <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
                    <p className="text-sm text-destructive">{generateError}</p>
                    
                    {needsCpf && (
                      <div className="space-y-3 text-left bg-muted/30 p-4 rounded-lg">
                        <Label htmlFor="modal-pix-cpf" className="text-sm font-medium">
                          Informe seu CPF para continuar:
                        </Label>
                        <Input
                          id="modal-pix-cpf"
                          value={pixCpf}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, '').slice(0, 11);
                            if (value.length > 9) value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9)}`;
                            else if (value.length > 6) value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`;
                            else if (value.length > 3) value = `${value.slice(0, 3)}.${value.slice(3)}`;
                            setPixCpf(value);
                          }}
                          placeholder="000.000.000-00"
                          className="text-center"
                        />
                        <Button
                          onClick={() => generateRealPixCode(pixCpf)}
                          className="w-full"
                          disabled={pixCpf.replace(/\D/g, '').length !== 11}
                        >
                          Gerar PIX com CPF
                        </Button>
                      </div>
                    )}
                    
                    <div className="flex gap-2 justify-center">
                      {!needsCpf && (
                        <Button onClick={() => generateRealPixCode()} variant="outline" size="sm">
                          Tentar novamente
                        </Button>
                      )}
                      <Button onClick={() => setPaymentMethod('select')} variant="ghost" size="sm">
                        Outro método
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="QR Code PIX" className="h-48 w-48 mx-auto rounded-lg border" />
                    ) : (
                      <QrCode className="h-24 w-24 mx-auto text-primary" />
                    )}

                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Escaneie o QR Code ou copie o código PIX</h3>
                      <p className="text-sm text-muted-foreground">Use o app do seu banco para pagar</p>
                    </div>

                    {pixExpiry && (
                      <div className="flex items-center justify-center gap-2 text-sm text-warning">
                        <Clock className="h-4 w-4" />
                        Expira em: {pixExpiry.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}

                    {pixCode && (
                      <div className="space-y-2">
                        <Label htmlFor="pix-code">Código PIX Copia e Cola:</Label>
                        <div className="flex gap-2">
                          <Input id="pix-code" value={pixCode} readOnly className="font-mono text-xs" />
                          <Button onClick={copyPixCode} variant="outline" size="sm">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    <Button onClick={handleVerifyPayment} className="w-full" disabled={isLoading || isVerifying || !pixPaymentId}>
                      {isVerifying ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Verificando pagamento...</>
                      ) : (
                        <><CheckCircle2 className="h-4 w-4 mr-2" />Já Paguei - Verificar</>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground">
                      Após efetuar o pagamento, aguarde alguns segundos e clique no botão acima.
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Card Payment */}
        {paymentMethod === 'card' && (
          <CardPaymentForm
            plan={plan}
            onSuccess={onPaymentSuccess}
            onCancel={() => setPaymentMethod('select')}
          />
        )}

        {paymentMethod === 'pix' && (
          <Button onClick={() => setPaymentMethod('select')} variant="outline" className="w-full" disabled={isLoading || isVerifying}>
            ← Voltar aos métodos
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
