import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { ShieldAlert } from 'lucide-react';

interface Props {
  accepted: boolean;
  onChange: (v: boolean) => void;
}

const SolicitanteTermsAlert: React.FC<Props> = ({ accepted, onChange }) => (
  <div className="rounded-lg border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800/50 p-4">
    <div className="flex items-start gap-2 mb-2">
      <ShieldAlert className="h-5 w-5 text-yellow-700 dark:text-yellow-400 mt-0.5 shrink-0" />
      <h4 className="font-semibold text-yellow-900 dark:text-yellow-200 text-sm">
        AVISO DE SEGURANÇA E CONDIÇÕES DE USO
      </h4>
    </div>
    <div className="max-h-40 overflow-y-auto text-xs text-yellow-900/90 dark:text-yellow-100/90 space-y-2 pr-1">
      <p><strong>Blindagem de contato:</strong> é proibido compartilhar telefone, e-mail, redes sociais ou qualquer dado externo dentro do chat. Toda a comunicação deve ocorrer pela plataforma.</p>
      <p><strong>Política de cancelamento:</strong> cancelamentos consecutivos serão monitorados. Após <strong>3 cancelamentos</strong>, sua conta será bloqueada e entrará em análise ética.</p>
      <p><strong>Liberação de pagamento:</strong> o valor só é repassado ao freelancer após você marcar o serviço como concluído e enviar a avaliação.</p>
      <p><strong>Limitação de responsabilidade:</strong> a HelpAqui é uma plataforma de intermediação. A execução técnica do serviço é responsabilidade exclusiva do freelancer contratado.</p>
    </div>
    <label className="flex items-center gap-2 mt-3 cursor-pointer">
      <Checkbox checked={accepted} onCheckedChange={(v) => onChange(!!v)} />
      <span className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
        Li e concordo com os termos acima
      </span>
    </label>
  </div>
);

export default SolicitanteTermsAlert;
