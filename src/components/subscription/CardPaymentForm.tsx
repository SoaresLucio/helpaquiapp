import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionPlan } from '@/services/subscriptionService';

interface CardPaymentFormProps {
  plan: SubscriptionPlan;
  onSuccess: () => void;
  onCancel: () => void;
}

const CardPaymentForm: React.FC<CardPaymentFormProps> = ({ plan, onSuccess, onCancel }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardData, setCardData] = useState({
    holderName: '',
    number: '',
    expiryMonth: '',
    expiryYear: '',
    ccv: '',
    cpf: '',
    postalCode: '',
    addressNumber: '',
  });

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 16);
    return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const handleChange = (field: string, value: string) => {
    if (field === 'number') {
      value = formatCardNumber(value);
    }
    if (field === 'expiryMonth') {
      value = value.replace(/\D/g, '').slice(0, 2);
    }
    if (field === 'expiryYear') {
      value = value.replace(/\D/g, '').slice(0, 4);
    }
    if (field === 'ccv') {
      value = value.replace(/\D/g, '').slice(0, 4);
    }
    if (field === 'cpf') {
      value = value.replace(/\D/g, '').slice(0, 11);
      // Format CPF
      if (value.length > 9) {
        value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9)}`;
      } else if (value.length > 6) {
        value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`;
      } else if (value.length > 3) {
        value = `${value.slice(0, 3)}.${value.slice(3)}`;
      }
    }
    setCardData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cardData.holderName || !cardData.number || !cardData.expiryMonth || !cardData.expiryYear || !cardData.ccv) {
      toast.error('Preencha todos os dados do cartão');
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-card-subscription', {
        body: {
          planId: plan.id,
          cardData: {
            holderName: cardData.holderName,
            number: cardData.number.replace(/\s/g, ''),
            expiryMonth: cardData.expiryMonth,
            expiryYear: cardData.expiryYear,
            ccv: cardData.ccv,
            cpf: cardData.cpf.replace(/\D/g, ''),
            postalCode: cardData.postalCode.replace(/\D/g, ''),
            addressNumber: cardData.addressNumber,
          },
        },
      });

      if (error) throw new Error(error.message || 'Erro ao processar cartão');
      if (data?.error) throw new Error(data.error);

      toast.success(data?.message || 'Assinatura ativada com sucesso!');
      onSuccess();
    } catch (error: any) {
      console.error('Card payment error:', error);
      toast.error(error.message || 'Erro ao processar pagamento com cartão');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="holderName">Nome no cartão</Label>
        <Input
          id="holderName"
          value={cardData.holderName}
          onChange={(e) => handleChange('holderName', e.target.value)}
          placeholder="Nome como está no cartão"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cardNumber">Número do cartão</Label>
        <div className="relative">
          <Input
            id="cardNumber"
            value={cardData.number}
            onChange={(e) => handleChange('number', e.target.value)}
            placeholder="0000 0000 0000 0000"
            className="pl-10"
            required
          />
          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label htmlFor="expiryMonth">Mês</Label>
          <Input
            id="expiryMonth"
            value={cardData.expiryMonth}
            onChange={(e) => handleChange('expiryMonth', e.target.value)}
            placeholder="MM"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expiryYear">Ano</Label>
          <Input
            id="expiryYear"
            value={cardData.expiryYear}
            onChange={(e) => handleChange('expiryYear', e.target.value)}
            placeholder="AAAA"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ccv">CVV</Label>
          <Input
            id="ccv"
            value={cardData.ccv}
            onChange={(e) => handleChange('ccv', e.target.value)}
            placeholder="123"
            type="password"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cpf">CPF do titular</Label>
        <Input
          id="cpf"
          value={cardData.cpf}
          onChange={(e) => handleChange('cpf', e.target.value)}
          placeholder="000.000.000-00"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="postalCode">CEP</Label>
          <Input
            id="postalCode"
            value={cardData.postalCode}
            onChange={(e) => handleChange('postalCode', e.target.value.replace(/\D/g, '').slice(0, 8))}
            placeholder="00000-000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="addressNumber">Nº</Label>
          <Input
            id="addressNumber"
            value={cardData.addressNumber}
            onChange={(e) => handleChange('addressNumber', e.target.value)}
            placeholder="123"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
        <Lock className="h-4 w-4 flex-shrink-0" />
        <span>Seus dados são processados com segurança pelo gateway ASAAS. A cobrança será mensal e automática.</span>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1" disabled={isProcessing}>
          Voltar
        </Button>
        <Button type="submit" className="flex-1" disabled={isProcessing}>
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Assinar R$ {plan.price_monthly.toFixed(2).replace('.', ',')}/ mês
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default CardPaymentForm;
