
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
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Termos de Uso – HelpAqui!</DialogTitle>
          <DialogDescription>
            Última atualização: 24/04/2025
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[50vh] pr-4">
          <div className="space-y-4 text-sm">
            <p>
              Seja bem-vindo(a) ao HelpAqui!, um aplicativo que conecta pessoas que
              precisam de ajuda com tarefas simples do dia a dia a outras dispostas a
              realizá-las. Ao usar nossos serviços, você concorda com os termos e
              condições descritos abaixo.
            </p>
            
            <h3 className="font-semibold text-base">1. Aceitação dos Termos</h3>
            <p>
              Ao acessar ou utilizar o aplicativo HelpAqui, você concorda que leu,
              compreendeu e aceitou estes Termos de Uso e nossa Política de Privacidade.
            </p>
            
            <h3 className="font-semibold text-base">2. Cadastro e Responsabilidades</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>O usuário deve fornecer informações verdadeiras e completas no momento do cadastro.</li>
              <li>O solicitante e o ajudante devem ser maiores de 18 anos.</li>
              <li>O ajudante autoriza a verificação de antecedentes criminais para garantir a segurança da comunidade.</li>
              <li>O HelpAqui se reserva o direito de suspender ou excluir cadastros com informações falsas ou uso indevido do app.</li>
              <li>O Usuário é o único responsável pelas atividades que ocorrem em seu
                cadastro e login, devendo guardar sua senha de cadastro em local seguro. O
                Usuário deve notificar o HelpAqui imediatamente sobre qualquer violação de
                segurança ou uso não autorizado de seu cadastro. Embora o aplicativo não
                seja responsável por qualquer perda causada ao Usuário pelo uso não
                autorizado de seu cadastro, o Usuário poderá ser responsabilizado pelas
                perdas do HelpAqui ou de terceiros oriundas de tal uso não autorizado.</li>
            </ul>
            
            <h3 className="font-semibold text-base">3. Funcionamento da Plataforma</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>O HelpAqui atua como intermediador entre solicitantes e ajudantes.</li>
              <li>O valor mínimo para qualquer tarefa é de R$10,00.</li>
              <li>O solicitante pode especificar preferências (ex: gênero do ajudante, forma de
                pagamento, agendamento).</li>
              <li>O ajudante pode aceitar ou fazer uma contra-proposta antes de fechar o
                serviço.</li>
              <li>As partes são responsáveis pela execução, pontualidade e qualidade da tarefa
                acordada.</li>
            </ul>
            
            <h3 className="font-semibold text-base">4. Pagamento e Comissão</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>O pagamento é feito diretamente pelo app, via Pix, cartão ou saldo interno.</li>
              <li>O HelpAqui pode reter uma porcentagem do valor como taxa de intermediação.</li>
              <li>Em caso de disputa, o HelpAqui tentará intermediar, mas não se responsabiliza
                por acordos mal cumpridos.</li>
            </ul>
            
            <h3 className="font-semibold text-base">5. Avaliações e Reputação</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Após a conclusão da tarefa, ambas as partes podem se avaliar.</li>
              <li>Avaliações impactam a visibilidade e prioridade de acesso às tarefas.</li>
              <li>Comentários ofensivos ou difamatórios poderão ser removidos.</li>
            </ul>
            
            <h3 className="font-semibold text-base">6. Regras de Conduta</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>É proibido usar o HelpAqui para fins ilícitos ou abusivos.</li>
              <li>Assédio, discriminação, violência ou qualquer comportamento inadequado
                resultará em banimento imediato.</li>
              <li>É vedada a negociação de serviços fora da plataforma após conexão inicial via
                app.</li>
            </ul>
            
            <h3 className="font-semibold text-base">7. Privacidade e Segurança</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Os dados fornecidos são tratados conforme a Lei Geral de Proteção de
                Dados (LGPD).</li>
              <li>Apenas dados necessários são compartilhados entre solicitante e ajudante
                para realização da tarefa.</li>
              <li>O HelpAqui adota medidas para garantir a proteção dos dados, mas não se
                responsabiliza por incidentes fora de seu controle.</li>
            </ul>
            
            <h3 className="font-semibold text-base">8. Responsabilidade</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>O HelpAqui não é empregador dos ajudantes nem garante sua qualificação
                além da verificação documental e avaliações.</li>
              <li>Qualquer prejuízo causado por um usuário deverá ser resolvido diretamente
                entre as partes ou via autoridades competentes.</li>
              <li>O HelpAqui não se responsabiliza por perdas, danos ou prejuízos decorrentes
                da execução das tarefas.</li>
              <li>"Serviço" significa todos as tarefas ofertados dentro da plataforma. Todos os
                serviços entre profissional e cliente e o ajudante autônomo não se aplicam em
                nenhum tipo de vínculo trabalhista. Todos os usuários estão sendo
                recompensados para realizar tarefas.</li>
              <li>"Aceitar serviço" significa que você se compromete a realizar o serviço
                oferecido na descrição, no tempo em que deve ser concluído (a "Data de
                Conclusão") e para tanto aceita receber a taxa associada e/ou recompensa (o
                "Pagamento"). Um serviço aceito é uma solicitação de serviço que ainda não foi
                aceita por nenhum outro usuário. Depois que um ajudante "Aceitar um serviço"
                se tornará um "compromisso". Cada Compromisso constitui um novo contrato
                entre o Cliente e Profissional.</li>
            </ul>
            
            <h3 className="font-semibold text-base">9. Benefícios e contribuições</h3>
            <p>
              Você não tem direito nem se qualifica para quaisquer benefícios que o
              HelpAqui, seus pais, subsidiárias, afiliadas ou outras entidades relacionadas
              possam disponibilizar para seus funcionários, como seguro de grupo,
              participação nos lucros ou benefícios de aposentadoria. Como você é um
              contratado independente, o HelpAqui não reterá nem fará pagamentos pela
              previdência social, fará seguro-desemprego ou contribuições para seguroinvalidez ou obterá seguro-desemprego em seu nome.
            </p>
            
            <h3 className="font-semibold text-base">10. Isenção de Responsabilidade de Garantias; Limitação de Responsabilidade</h3>
            <p>
              Nós não garantimos, representamos ou justificamos que o seu uso do nosso
              serviço não será interrompido, pontual, seguro ou livre de erros.
              Não garantimos que os resultados que possam ser obtidos do uso do serviço
              serão precisos ou confiáveis. Você concorda que de tempos em tempos, nós
              podemos remover o serviço por períodos indefinidos de tempo ou cancelar a
              qualquer momento, sem notificação para você.
            </p>
            <p>
              Você expressamente concorda que o seu uso de, ou falta de habilidade de
              usar, o serviço é por sua conta e risco. O serviço e todos os produtos e
              serviços entregues para você através do serviço são (exceto como
              expressamente declarado por nós) fornecidos 'como são' e 'conforme
              disponível' para seu uso, sem qualquer representação, garantias ou condições
              de qualquer tipo, expressa ou implícita, incluindo todas as garantias implícitas
              ou condições de comercialidade, quantidade negociável, adequação a uma
              finalidade específica, durabilidade, título, e não violação. Em nenhum caso
              devem a HelpAqui, nossos diretores, oficiais, funcionários, afiliados, agentes,
              contratantes, estagiários, fornecedores, fornecedores de serviço ou
              licenciadores ser responsáveis por qualquer prejuízo, perda, reclamação ou
              danos diretos, indiretos, incidentais, punitivos, especiais ou consequentes de
              qualquer tipo, incluindo, sem limitação, lucros cessantes, perda de receitas,
              poupanças perdidas, perda de dados, custos de reposição, ou quaisquer danos
              semelhantes, seja com base em contrato, ato ilícito (incluindo negligência),
              responsabilidade objetiva ou de outra forma, decorrentes do seu uso de
              qualquer um dos serviços ou quaisquer produtos adquiridos usando o serviço,
              ou para qualquer outra reclamação relacionada de alguma forma para o seu
              uso do serviço ou qualquer produto, incluindo, mas não limitado a, quaisquer
              erros ou omissões em qualquer conteúdo, ou qualquer perda ou dano de
              qualquer tipo incorridos como resultado do uso do serviço ou qualquer
              conteúdo (ou produto) publicado, transmitido ou de outra forma disponível
              através do serviço, mesmo se avisados de sua possibilidade. As missões de
              que trata este termo de uso podem ser recusadas por qualquer das partes, sem
              necessidade de justificativa de parte a parte. Você poderá recusar missões
              mediante: a) desinstalação do aplicativo; b) realização de log-off do aplicativo;
              c) recusa automática pela expiração do prazo de conclusão da missão; d)
              desistência da missão.
            </p>
            
            <h3 className="font-semibold text-base">11. Alterações nos Termos</h3>
            <p>
              Estes termos podem ser atualizados periodicamente. A continuação do uso do
              app implica aceitação das alterações.
            </p>
            
            <h3 className="font-semibold text-base">12. Contato</h3>
            <p>
              Dúvidas, sugestões ou denúncias podem ser enviadas para:
              helpaquiapp@hotmail.com
            </p>
          </div>
        </ScrollArea>
        
        <DialogFooter>
          <Button onClick={onAccept}>Aceitar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TermsOfUseDialog;
