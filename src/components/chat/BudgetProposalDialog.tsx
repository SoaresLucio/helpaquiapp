import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Briefcase, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface BudgetProposalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { title: string; description: string; valueCents: number; deliveryDays?: number }) => void;
  defaultTitle?: string;
}

const BudgetProposalDialog: React.FC<BudgetProposalDialogProps> = ({ open, onOpenChange, onSubmit, defaultTitle }) => {
  const [title, setTitle] = useState(defaultTitle ?? '');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('');

  const handleSubmit = () => {
    const t = title.trim();
    const num = Number(value.replace(',', '.'));
    if (t.length < 3) { toast.error('Informe um título'); return; }
    if (!Number.isFinite(num) || num <= 0) { toast.error('Informe um valor válido'); return; }
    onSubmit({
      title: t,
      description: description.trim(),
      valueCents: Math.round(num * 100),
      deliveryDays: deliveryDays ? Number(deliveryDays) : undefined,
    });
    setTitle(defaultTitle ?? ''); setDescription(''); setValue(''); setDeliveryDays('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" /> Enviar proposta de orçamento
          </DialogTitle>
          <DialogDescription>
            Descreva o serviço, o valor e o prazo. A outra parte pode aceitar e prosseguir para o pagamento.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <Label htmlFor="prop-title">Título do serviço</Label>
            <Input id="prop-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Instalação de chuveiro" maxLength={120} />
          </div>
          <div>
            <Label htmlFor="prop-desc">Descrição (opcional)</Label>
            <Textarea id="prop-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Escopo, materiais, observações..." maxLength={1000} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="prop-value">Valor (R$)</Label>
              <Input id="prop-value" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value.replace(/[^\d.,]/g, ''))} placeholder="0,00" />
            </div>
            <div>
              <Label htmlFor="prop-days">Prazo (dias)</Label>
              <Input id="prop-days" inputMode="numeric" value={deliveryDays} onChange={(e) => setDeliveryDays(e.target.value.replace(/\D/g, ''))} placeholder="Ex: 3" />
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>
            <Briefcase className="h-4 w-4 mr-2" /> Enviar proposta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BudgetProposalDialog;
