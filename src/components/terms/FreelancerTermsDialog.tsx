import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ShieldAlert } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
  title?: string;
}

const FreelancerTermsDialog: React.FC<Props> = ({ open, onOpenChange, onAccept, title = 'REGRAS PARA PRESTAÇÃO DE HELP' }) => {
  const [accepted, setAccepted] = useState(false);

  const handleConfirm = () => {
    if (!accepted) return;
    onAccept();
    setAccepted(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) setAccepted(false); onOpenChange(v); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-300">
            <ShieldAlert className="h-5 w-5" /> {title}
          </DialogTitle>
          <DialogDescription>
            Antes de prosseguir, leia e aceite as regras abaixo.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-md border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800/50 p-3 max-h-64 overflow-y-auto text-sm text-yellow-900 dark:text-yellow-100 space-y-2">
          <p><strong>Comunicação exclusiva:</strong> toda interação deve acontecer dentro da plataforma. Compartilhar contatos externos pode resultar em <strong>banimento imediato</strong>.</p>
          <p><strong>Garantia de recebimento:</strong> o valor só é liberado para você após o solicitante confirmar a conclusão do serviço e enviar a avaliação.</p>
          <p><strong>Prova de serviço:</strong> envie fotos do serviço concluído pelo chat para acelerar a liberação do pagamento e proteger sua reputação.</p>
          <p><strong>Natureza do serviço:</strong> a responsabilidade técnica e legal pelo serviço executado é integralmente sua. A HelpAqui apenas intermedia o contato.</p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer mt-1">
          <Checkbox checked={accepted} onCheckedChange={(v) => setAccepted(!!v)} />
          <span className="text-sm font-medium">Aceito os termos e desejo prosseguir</span>
        </label>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleConfirm} disabled={!accepted}>Prosseguir</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FreelancerTermsDialog;
