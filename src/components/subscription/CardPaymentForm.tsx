import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Loader2, Lock, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionPlan } from '@/services/subscriptionService';

interface CardPaymentFormProps {
  plan: SubscriptionPlan;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * SECURITY: This form NO LONGER collects credit card data.
 * Card capture happens entirely on Asaas's PCI-compliant hosted page.
 * We only collect/confirm the CPF (required by Asaas to create the customer)
 * and then redirect the user to the secure Asaas checkout URL.
 */
const CardPaymentForm: React.FC<CardPaymentFormProps> = ({ plan, onCancel }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cpf, setCpf] = useState('');

  const formatCpf = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 11);
    if (cleaned.length > 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
    if (cleaned.length > 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
    if (cleaned.length > 3) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
    return cleaned;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-card-subscription', {
        body: {
          planId: plan.id,
          cpf: cpf.replace(/\D/g, ''),
          returnUrl: `${window.location.origin}/dashboard?subscription=pending`,
        },
      });

      if (error) throw new Error(error.message || 'Erro ao iniciar pagamento');
      if (data?.error) throw new Error(data.error);
      if (!data?.checkoutUrl) throw new Error('Link de pagamento indisponível');

      toast.success('Redirecionando para o pagamento seguro do Asaas...');
      window.location.href = data.checkoutUrl;
    } catch (error: any) {
      console.error('Checkout init error:', error);
      toast.error(error.message || 'Erro ao iniciar pagamento');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
        <Lock className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <span>
          Para sua segurança, os dados do cartão são preenchidos diretamente na página segura do
          gateway ASAAS (PCI DSS). O HelpAqui nunca vê nem armazena o número do cartão ou CVV.
        </span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cpf">CPF do titular</Label>
        <Input
          id="cpf"
          value={cpf}
          onChange={(e) => setCpf(formatCpf(e.target.value))}
          placeholder="000.000.000-00"
          required
        />
        <p className="text-xs text-muted-foreground">
          Caso seu perfil já tenha um CPF verificado, este campo é apenas confirmação.
        </p>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1" disabled={isProcessing}>
          Voltar
        </Button>
        <Button type="submit" className="flex-1" disabled={isProcessing}>
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Redirecionando...
            </>
          ) : (
            <>
              <ExternalLink className="h-4 w-4 mr-2" />
              Pagar R$ {plan.price_monthly.toFixed(2).replace('.', ',')}/mês
            </>
          )}
        </Button>
      </div>

      <p className="text-[11px] text-muted-foreground text-center flex items-center justify-center gap-1">
        <CreditCard className="h-3 w-3" />
        Você será redirecionado para o ambiente seguro do Asaas para concluir o pagamento.
      </p>
    </form>
  );
};

export default CardPaymentForm;
