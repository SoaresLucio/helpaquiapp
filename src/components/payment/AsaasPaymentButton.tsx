
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, DollarSign, Shield } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { createAsaasPayment, calculatePlatformFee } from '@/services/asaasService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AsaasPaymentButtonProps {
  amount: number;
  serviceId: string;
  freelancerId: string;
  description: string;
  onPaymentStart?: () => void;
  onPaymentComplete?: () => void;
}

const AsaasPaymentButton: React.FC<AsaasPaymentButtonProps> = ({
  amount,
  serviceId,
  freelancerId,
  description,
  onPaymentStart,
  onPaymentComplete
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  const { fee, freelancerAmount } = calculatePlatformFee(amount);

  const handlePayment = async () => {
    setIsProcessing(true);
    onPaymentStart?.();

    try {
      const response = await createAsaasPayment({
        amount,
        serviceId,
        freelancerId,
        description
      });

      if (response.success && response.url) {
        // Open Asaas payment page in new tab
        window.open(response.url, '_blank', 'noopener,noreferrer');
        
        toast({
          title: "Redirecionando para pagamento",
          description: "Você será redirecionado para o Asaas para completar o pagamento de forma segura."
        });
        
        onPaymentComplete?.();
      } else {
        throw new Error(response.error || 'Payment initialization failed');
      }
    } catch (error) {
      toast({
        title: "Erro no pagamento",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="border-2 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-600" />
          Pagamento Seguro via Asaas
        </CardTitle>
        <CardDescription>
          Processamento seguro via Asaas com criptografia HTTPS
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Valor do serviço:</span>
            <span className="font-medium">R$ {(amount / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-orange-600">
            <span>Taxa da plataforma (10%):</span>
            <span className="font-medium">R$ {(fee / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-green-600 border-t pt-2">
            <span>Repasse ao freelancer:</span>
            <span className="font-medium">R$ {(freelancerAmount / 100).toFixed(2)}</span>
          </div>
        </div>
        
        <Button 
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          {isProcessing ? "Processando..." : `Pagar R$ ${(amount / 100).toFixed(2)}`}
        </Button>
        
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <Shield className="h-3 w-3" />
          <span>Protegido por criptografia SSL/TLS via Asaas</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default AsaasPaymentButton;
