
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TermsOfUseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
}

const TermsOfUseDialog: React.FC<TermsOfUseDialogProps> = ({
  open,
  onOpenChange,
  onAccept,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] bg-white border border-gray-200 shadow-2xl z-[100]">
        <DialogHeader className="border-b border-gray-100 pb-4">
          <DialogTitle className="text-xl font-bold text-gray-900">Termos de Uso – HelpAqui!</DialogTitle>
          <DialogDescription className="text-gray-600">
            Última atualização: 24/04/2025
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[50vh] pr-4 bg-white">
          <div className="space-y-4 text-sm text-gray-700 bg-white p-2">
            <p className="leading-relaxed">
              Seja bem-vindo(a) ao HelpAqui!, um aplicativo que conecta pessoas que
              precisam de ajuda com tarefas simples do dia a dia a outras dispostas a
              realizá-las. Ao usar nossos serviços, você concorda com os termos e
              condições descritos abaixo.
            </p>
            
            <h3 className="font-semibold text-base text-gray-900 mt-6">1. Aceitação dos Termos</h3>
            <p className="leading-relaxed">
              Ao acessar ou utilizar o aplicativo HelpAqui, você concorda que leu,
              compreendeu e aceitou estes Termos de Uso e nossa Política de Privacidade.
            </p>
            
            <h3 className="font-semibold text-base text-gray-900 mt-6">2. Cadastro e Responsabilidades</h3>
            <ul className="list-disc pl-5 space-y-2 leading-relaxed">
              <li>O usuário deve fornecer informações verdadeiras e completas no momento do cadastro.</li>
              <li>O solicitante e o ajudante devem ser maiores de 18 anos.</li>
              <li>O ajudante autoriza a verificação de antecedentes criminais para garantir a segurança da comunidade.</li>
              <li>O HelpAqui se reserva o direito de suspender ou excluir cadastros com informações falsas ou uso indevido do app.</li>
              <li>O Usuário é o único responsável pelas atividades que ocorrem em seu
                cadastro e login, devendo guardar sua senha de cadastro em local seguro. O
                Usuário deve notificar o HelpAqui imediatamente sobre qualquer violação de
                segurança ou uso não autorizado de seu cadastro.</li>
            </ul>
            
            <h3 className="font-semibold text-base text-gray-900 mt-6">3. Funcionamento da Plataforma</h3>
            <ul className="list-disc pl-5 space-y-2 leading-relaxed">
              <li>O HelpAqui atua como intermediador entre solicitantes e ajudantes.</li>
              <li>O valor mínimo para qualquer tarefa é de R$10,00.</li>
              <li>O solicitante pode especificar preferências (ex: gênero do ajudante, forma de
                pagamento, agendamento).</li>
              <li>O ajudante pode aceitar ou fazer uma contra-proposta antes de fechar o
                serviço.</li>
              <li>As partes são responsáveis pela execução, pontualidade e qualidade da tarefa
                acordada.</li>
            </ul>
            
            <h3 className="font-semibold text-base text-gray-900 mt-6">4. Pagamento e Comissão</h3>
            <ul className="list-disc pl-5 space-y-2 leading-relaxed">
              <li>O pagamento é feito diretamente pelo app, via Pix, cartão ou saldo interno.</li>
              <li>O HelpAqui pode reter uma porcentagem do valor como taxa de intermediação.</li>
              <li>Em caso de disputa, o HelpAqui tentará intermediar, mas não se responsabiliza
                por acordos mal cumpridos.</li>
            </ul>
            
            <h3 className="font-semibold text-base text-gray-900 mt-6">5. Avaliações e Reputação</h3>
            <ul className="list-disc pl-5 space-y-2 leading-relaxed">
              <li>Após a conclusão da tarefa, ambas as partes podem se avaliar.</li>
              <li>Avaliações impactam a visibilidade e prioridade de acesso às tarefas.</li>
              <li>Comentários ofensivos ou difamatórios poderão ser removidos.</li>
            </ul>
            
            <h3 className="font-semibold text-base text-gray-900 mt-6">6. Regras de Conduta</h3>
            <ul className="list-disc pl-5 space-y-2 leading-relaxed">
              <li>É proibido usar o HelpAqui para fins ilícitos ou abusivos.</li>
              <li>Assédio, discriminação, violência ou qualquer comportamento inadequado
                resultará em banimento imediato.</li>
              <li>É vedada a negociação de serviços fora da plataforma após conexão inicial via
                app.</li>
            </ul>
            
            <h3 className="font-semibold text-base text-gray-900 mt-6">7. Privacidade e Segurança</h3>
            <ul className="list-disc pl-5 space-y-2 leading-relaxed">
              <li>Os dados fornecidos são tratados conforme a Lei Geral de Proteção de
                Dados (LGPD).</li>
              <li>Apenas dados necessários são compartilhados entre solicitante e ajudante
                para realização da tarefa.</li>
              <li>O HelpAqui adota medidas para garantir a proteção dos dados, mas não se
                responsabiliza por incidentes fora de seu controle.</li>
            </ul>
            
            <h3 className="font-semibold text-base text-gray-900 mt-6">8. Responsabilidade</h3>
            <ul className="list-disc pl-5 space-y-2 leading-relaxed">
              <li>O HelpAqui não é empregador dos ajudantes nem garante sua qualificação
                além da verificação documental e avaliações.</li>
              <li>Qualquer prejuízo causado por um usuário deverá ser resolvido diretamente
                entre as partes ou via autoridades competentes.</li>
              <li>O HelpAqui não se responsabiliza por perdas, danos ou prejuízos decorrentes
                da execução das tarefas.</li>
            </ul>
            
            <h3 className="font-semibold text-base text-gray-900 mt-6">9. Contato</h3>
            <p className="leading-relaxed">
              Dúvidas, sugestões ou denúncias podem ser enviadas para:
              helpaquiapp@hotmail.com
            </p>
          </div>
        </ScrollArea>
        
        <DialogFooter className="border-t border-gray-100 pt-4 bg-white">
          <div className="flex gap-3 w-full">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              onClick={onAccept}
              className="flex-1 bg-helpaqui-purple hover:bg-helpaqui-purple/90"
            >
              Aceitar Termos
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TermsOfUseDialog;
