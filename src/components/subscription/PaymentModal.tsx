import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, CreditCard, QrCode, Clock, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { SubscriptionPlan } from '@/services/subscriptionService';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan | null;
  onPaymentSuccess: () => void;
  isLoading?: boolean;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  plan,
  onPaymentSuccess,
  isLoading = false
}) => {
  const [activeTab, setActiveTab] = useState('pix');
  const [pixCode, setPixCode] = useState('');
  const [pixExpiry, setPixExpiry] = useState<Date | null>(null);
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvc: ''
  });

  // Gerar código PIX quando o modal abrir
  useEffect(() => {
    if (isOpen && plan && activeTab === 'pix') {
      generatePixCode();
    }
  }, [isOpen, plan, activeTab]);

  const generatePixCode = () => {
    // Simular geração de código PIX
    const code = `00020101021226580014br.gov.bcb.pix2536helpaqui@gmail.com52040000530398654${plan?.price_monthly.toFixed(2)}5925HELPAQUI SERVICOS LTDA6009SAO PAULO61082000000062190515HELPAQUI${Date.now()}6304`;
    setPixCode(code);
    
    // Definir expiração para 15 minutos
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 15);
    setPixExpiry(expiry);
  };

  const copyPixCode = () => {
    navigator.clipboard.writeText(pixCode);
    toast.success('Código PIX copiado!');
  };

  const handleCardInputChange = (field: string, value: string) => {
    setCardData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length >= 2) {
      return numbers.substring(0, 2) + '/' + numbers.substring(2, 4);
    }
    return numbers;
  };

  const handlePixPayment = () => {
    toast.success('Aguardando confirmação do pagamento PIX...');
    // Simular processamento
    setTimeout(() => {
      onPaymentSuccess();
    }, 2000);
  };

  const handleCardPayment = () => {
    if (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvc) {
      toast.error('Preencha todos os dados do cartão');
      return;
    }
    
    toast.success('Processando pagamento...');
    // Simular processamento
    setTimeout(() => {
      onPaymentSuccess();
    }, 3000);
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

        {/* Resumo do plano */}
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
                <Badge variant="secondary" className="text-xs">
                  /mês
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pix" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              PIX
            </TabsTrigger>
            <TabsTrigger value="card" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Cartão
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pix" className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center space-y-4">
                  <QrCode className="h-24 w-24 mx-auto text-primary" />
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Escaneie o QR Code ou copie o código PIX
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Use o app do seu banco para pagar
                    </p>
                  </div>

                  {pixExpiry && (
                    <div className="flex items-center justify-center gap-2 text-sm text-orange-600">
                      <Clock className="h-4 w-4" />
                      Expira em: {pixExpiry.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="pix-code">Código PIX:</Label>
                    <div className="flex gap-2">
                      <Input
                        id="pix-code"
                        value={pixCode}
                        readOnly
                        className="font-mono text-xs"
                      />
                      <Button onClick={copyPixCode} variant="outline" size="sm">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Button 
                    onClick={handlePixPayment}
                    className="w-full"
                    disabled={isLoading}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Já Paguei
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="card" className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="card-number">Número do cartão</Label>
                  <Input
                    id="card-number"
                    placeholder="1234 5678 9012 3456"
                    value={formatCardNumber(cardData.number)}
                    onChange={(e) => handleCardInputChange('number', e.target.value)}
                    maxLength={19}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="card-name">Nome no cartão</Label>
                  <Input
                    id="card-name"
                    placeholder="JOÃO DA SILVA"
                    value={cardData.name}
                    onChange={(e) => handleCardInputChange('name', e.target.value.toUpperCase())}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="card-expiry">Validade</Label>
                    <Input
                      id="card-expiry"
                      placeholder="MM/AA"
                      value={formatExpiry(cardData.expiry)}
                      onChange={(e) => handleCardInputChange('expiry', e.target.value)}
                      maxLength={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="card-cvc">CVC</Label>
                    <Input
                      id="card-cvc"
                      placeholder="123"
                      value={cardData.cvc}
                      onChange={(e) => handleCardInputChange('cvc', e.target.value)}
                      maxLength={4}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleCardPayment}
                  className="w-full"
                  disabled={isLoading}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pagar R$ {plan.price_monthly.toFixed(2).replace('.', ',')}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Button 
          onClick={onClose}
          variant="outline"
          className="w-full"
          disabled={isLoading}
        >
          Cancelar
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;