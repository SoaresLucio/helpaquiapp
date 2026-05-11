import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface HireServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  freelancerId: string;
  freelancerName: string;
  defaultTitle?: string;
}

const HireServiceDialog: React.FC<HireServiceDialogProps> = ({
  open, onOpenChange, conversationId, freelancerId, freelancerName, defaultTitle,
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState(defaultTitle ?? '');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => { setTitle(defaultTitle ?? ''); setDescription(''); setValue(''); };

  const handleSubmit = async () => {
    if (!user) { toast.error('Você precisa estar logado'); return; }
    const trimmedTitle = title.trim();
    const numericValue = Number(value.replace(',', '.'));
    if (trimmedTitle.length < 3) { toast.error('Informe um título para o serviço'); return; }
    if (!Number.isFinite(numericValue) || numericValue <= 0) { toast.error('Informe um valor válido em reais'); return; }

    setSubmitting(true);
    try {
      // 1. Create the service request
      const { data: request, error: reqError } = await supabase
        .from('service_requests')
        .insert({
          client_id: user.id,
          title: trimmedTitle,
          description: description.trim() || null,
          category: 'Outros',
          status: 'in_progress',
          budget_min: Math.round(numericValue * 100),
          budget_max: Math.round(numericValue * 100),
        })
        .select()
        .single();
      if (reqError) throw reqError;

      // 2. Create accepted proposal linking the freelancer
      const { error: propError } = await supabase
        .from('service_proposals')
        .insert({
          service_request_id: request.id,
          freelancer_id: freelancerId,
          status: 'accepted',
          proposed_price: Math.round(numericValue * 100),
          message: `Contratação direta via chat. Valor: R$ ${numericValue.toFixed(2).replace('.', ',')}`,
        });
      if (propError) throw propError;

      // 3. Link conversation to the request (best-effort)
      await supabase.from('conversations').update({ service_request_id: request.id }).eq('id', conversationId);

      // 4. Post a message in the chat about the hire
      await supabase.functions.invoke('send-chat-message', {
        body: {
          conversationId,
          content: `Serviço contratado: ${trimmedTitle} — Valor combinado: R$ ${numericValue.toFixed(2).replace('.', ',')}`,
          messageType: 'text',
          metadata: { kind: 'hire', service_request_id: request.id, value_cents: Math.round(numericValue * 100) },
        },
      });

      toast.success(`Serviço contratado com ${freelancerName}!`);
      reset();
      onOpenChange(false);
    } catch (err: any) {
      console.error('Hire error:', err);
      toast.error(err?.message ?? 'Não foi possível concluir a contratação.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!submitting) { if (!v) reset(); onOpenChange(v); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary" /> Contratar serviço</DialogTitle>
          <DialogDescription>Confirme os detalhes do serviço com {freelancerName}.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <Label htmlFor="hire-title">Título do serviço</Label>
            <Input id="hire-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Instalação de chuveiro" maxLength={120} />
          </div>
          <div>
            <Label htmlFor="hire-desc">Descrição (opcional)</Label>
            <Textarea id="hire-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalhes do que será feito..." maxLength={1000} rows={3} />
          </div>
          <div>
            <Label htmlFor="hire-value">Valor combinado (R$)</Label>
            <Input id="hire-value" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value.replace(/[^\d.,]/g, ''))} placeholder="0,00" />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Confirmar contratação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HireServiceDialog;
