import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Briefcase, DollarSign, AlertCircle } from 'lucide-react';
import { calculatePlatformFee } from '@/services/asaasService';

interface BudgetProposalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { title: string; description: string; valueCents: number; deliveryDays?: number }) => void;
  defaultTitle?: string;
  defaultDescription?: string;
  defaultValue?: string;
  defaultDeliveryDays?: string;
  mode?: 'new' | 'counter';
}

const formatBRL = (cents: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((cents || 0) / 100);

const BudgetProposalDialog: React.FC<BudgetProposalDialogProps> = ({
  open, onOpenChange, onSubmit,
  defaultTitle, defaultDescription, defaultValue, defaultDeliveryDays,
  mode = 'new',
}) => {
  const [title, setTitle] = useState(defaultTitle ?? '');
  const [description, setDescription] = useState(defaultDescription ?? '');
  const [value, setValue] = useState(defaultValue ?? '');
  const [deliveryDays, setDeliveryDays] = useState(defaultDeliveryDays ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset/prefill when dialog opens with new defaults (e.g. counter-proposal)
  useEffect(() => {
    if (open) {
      setTitle(defaultTitle ?? '');
      setDescription(defaultDescription ?? '');
      setValue(defaultValue ?? '');
      setDeliveryDays(defaultDeliveryDays ?? '');
      setErrors({});
    }
  }, [open, defaultTitle, defaultDescription, defaultValue, defaultDeliveryDays]);

  const num = Number((value || '').replace(',', '.'));
  const valueCents = Number.isFinite(num) ? Math.round(num * 100) : 0;
  const { fee, freelancerAmount } = calculatePlatformFee(valueCents);

  const validate = () => {
    const e: Record<string, string> = {};
    if (title.trim().length < 3) e.title = 'Informe um título com pelo menos 3 caracteres.';
    if (!Number.isFinite(num) || num <= 0) e.value = 'Informe um valor numérico maior que zero.';
    else if (num > 100000) e.value = 'Valor máximo permitido: R$ 100.000,00.';
    if (deliveryDays && (Number(deliveryDays) <= 0 || Number(deliveryDays) > 365))
      e.deliveryDays = 'Prazo deve estar entre 1 e 365 dias.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      valueCents,
      deliveryDays: deliveryDays ? Number(deliveryDays) : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            {mode === 'counter' ? 'Enviar contraproposta' : 'Enviar proposta de orçamento'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'counter'
              ? 'Sugira um novo valor e prazo. A outra parte poderá aceitar e prosseguir para o pagamento.'
              : 'Descreva o serviço, o valor e o prazo. A outra parte pode aceitar e prosseguir para o pagamento.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div>
            <Label htmlFor="prop-title">Título do serviço *</Label>
            <Input
              id="prop-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Instalação de chuveiro"
              maxLength={120}
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />{errors.title}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="prop-desc">Descrição (opcional)</Label>
            <Textarea
              id="prop-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Escopo, materiais, observações..."
              maxLength={1000}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="prop-value">Valor (R$) *</Label>
              <Input
                id="prop-value"
                inputMode="decimal"
                value={value}
                onChange={(e) => setValue(e.target.value.replace(/[^\d.,]/g, ''))}
                placeholder="0,00"
                aria-invalid={!!errors.value}
              />
              {errors.value && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />{errors.value}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="prop-days">Prazo (dias)</Label>
              <Input
                id="prop-days"
                inputMode="numeric"
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(e.target.value.replace(/\D/g, ''))}
                placeholder="Ex: 3"
                aria-invalid={!!errors.deliveryDays}
              />
              {errors.deliveryDays && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />{errors.deliveryDays}
                </p>
              )}
            </div>
          </div>

          {/* Fee breakdown — same calculation as payment screen */}
          {valueCents > 0 && (
            <div className="rounded-lg border border-border/60 bg-muted/40 p-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor do serviço</span>
                <span className="font-medium">{formatBRL(valueCents)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxa da plataforma (10%)</span>
                <span>{formatBRL(fee)}</span>
              </div>
              <div className="flex justify-between border-t border-border/60 pt-1">
                <span className="font-semibold">Total a pagar</span>
                <span className="font-semibold text-primary">{formatBRL(valueCents)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Repasse ao freelancer</span>
                <span>{formatBRL(freelancerAmount)}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>
            <Briefcase className="h-4 w-4 mr-2" />
            {mode === 'counter' ? 'Enviar contraproposta' : 'Enviar proposta'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BudgetProposalDialog;
