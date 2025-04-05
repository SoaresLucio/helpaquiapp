
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

interface PrivacyPolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
}

const PrivacyPolicyDialog: React.FC<PrivacyPolicyDialogProps> = ({
  open,
  onOpenChange,
  onAccept,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Política de Privacidade – HelpAqui!</DialogTitle>
          <DialogDescription>
            Última atualização: 05/04/2025
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[50vh] pr-4">
          <div className="space-y-4 text-sm">
            <p>
              A sua privacidade é importante para nós. Esta Política de Privacidade descreve como
              coletamos, usamos, armazenamos e protegemos as suas informações no aplicativo
              HelpAqui!. Ao utilizar nossos serviços, você concorda com os termos aqui descritos.
            </p>
            
            <h3 className="font-semibold text-base">1. Coleta de Dados Pessoais</h3>
            <p>Durante o uso do app, coletamos os seguintes dados:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Nome completo</li>
              <li>CPF e/ou RG</li>
              <li>Endereço de e-mail</li>
              <li>Número de telefone</li>
              <li>Endereço de residência e localização (via GPS)</li>
              <li>Dados bancários para repasses (ajudantes)</li>
              <li>Histórico de uso do aplicativo (tarefas realizadas/solicitadas, avaliações)</li>
              <li>Documentação para verificação (como antecedentes criminais)</li>
            </ul>
            <p>Essas informações são necessárias para garantir a segurança e o funcionamento da plataforma.</p>
            
            <h3 className="font-semibold text-base">2. Uso das Informações</h3>
            <p>Utilizamos seus dados para:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Criar e gerenciar sua conta</li>
              <li>Verificar sua identidade e histórico (quando necessário)</li>
              <li>Processar pagamentos e repasses</li>
              <li>Localizar tarefas e usuários próximos via geolocalização</li>
              <li>Enviar notificações importantes e operacionais</li>
              <li>Melhorar a experiência de uso no app</li>
              <li>Garantir a segurança da comunidade</li>
              <li>Campanhas publicitárias</li>
              <li>Ações promocionais</li>
              <li>Pesquisas de comportamento, etnográficas, tendências, mercado, campo, concorrência, satisfação de clientes</li>
              <li>Hábito de consumo</li>
              <li>Monitoramento e avaliação de preços, produtos, serviços, estoque, posicionamento em gondolas e pontos de venda</li>
              <li>Monitoramento de ações promocionais, campanhas e marcas</li>
              <li>Consumidor misterioso</li>
              <li>Avaliação de produtos e serviços</li>
            </ul>
            <p>
              Você está cedendo ao HelpAqui os direitos autorais e de utilização do conteúdo
              criado, tornando o HelpAqui proprietário do material gerado. Além disso, os direitos de
              utilização e autorais cedidos ao HelpAqui são exclusivos, o que significa que você não
              pode continuar a usar o conteúdo produzido como quiser, não permitindo a utilização
              do mesmo por terceiros sem consentimento da HelpAqui.
            </p>
            
            <h3 className="font-semibold text-base">3. Compartilhamento de Dados</h3>
            <p>Seus dados poderão ser compartilhados apenas:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Com outros usuários, quando necessário para realização da tarefa (ex: nome e telefone após confirmação)</li>
              <li>Com autoridades públicas, mediante requisição legal</li>
              <li>Com parceiros responsáveis por processar pagamentos e segurança (sempre de forma segura)</li>
            </ul>
            <p>Jamais vendemos ou comercializamos seus dados pessoais.</p>
            
            <h3 className="font-semibold text-base">4. Armazenamento e Segurança dos Dados</h3>
            <p>
              Seus dados são armazenados em servidores seguros, com criptografia e proteção
              contra acessos não autorizados.
              Utilizamos práticas recomendadas de segurança digital, incluindo autenticação de dois
              fatores e backups criptografados.
              Seus dados serão mantidos enquanto sua conta estiver ativa ou enquanto for
              necessário para cumprimento de obrigações legais.
              Não coletamos dados dos Usuários sem que o mesmo seja fornecidos
              voluntariamente e autorizado pelos Usuários. Os Usuários sempre serão notificados
              das informações que serão coletadas e terão total ciência das consequências de suas decisões, pelas quais são
              responsáveis.
            </p>
            
            <h3 className="font-semibold text-base">5. Limitações de Responsabilidade</h3>
            <p>
              Os Usuários se responsabilizam civil e criminalmente pela veracidade dos Dados
              fornecidos para a HelpAqui, bem como se comprometem a atualizar seus dados
              sempre que houver qualquer alteração, não sendo responsabilidade da HelpAqui
              verificar e atualizar a identidade, autenticidade ou veracidade de qualquer informação
              fornecida pelos Usuários.
            </p>
            <p>
              O Usuário desde já declara estar ciente de que o HelpAqui não assume nenhuma
              responsabilidade em caso de roubo, perda, alteração ou uso indevido de suas
              informações pessoais e do conteúdo como um todo, inclusive na hipótese de
              informações fornecidas a prestadores de serviços terceirizados.
            </p>
            <p>
              Os Usuários desde já reconhecem que o HelpAqui não se responsabiliza por qualquer
              conduta dos seus Usuários. Assim os Usuários ficam obrigados, caso o HelpAqui,
              seus administradores, sócios ou empregados venham a ser chamados a responder
              judicial ou extrajudicialmente pela prática de um ato ilícito e/ou ilegal através da
              utilização do aplicativo, a isentar a empresa HelpAqui, seus administradores, sócios ou
              empregados de quaisquer responsabilidades, bem como a requerer a exclusão dos
              mesmos do processo, se for o caso, bem como a indenizá-los por toda e qualquer
              despesa, custo ou perda que estes venham a incorrer, incluindo-se, porém não se
              limitando, a indenizações, custas judiciais e/ou honorários advocatícios.
            </p>
            
            <h3 className="font-semibold text-base">6. Direitos do Usuário (LGPD)</h3>
            <p>Você tem o direito de:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Confirmar a existência de tratamento de dados</li>
              <li>Acessar, corrigir ou excluir seus dados pessoais</li>
              <li>Revogar o consentimento a qualquer momento</li>
              <li>Solicitar a portabilidade dos seus dados</li>
              <li>Solicitar anonimização ou bloqueio em casos específicos</li>
            </ul>
            <p>
              Você pode exercer seus direitos entrando em contato com nosso suporte:
              helpaquiapp@hotmail.com
            </p>
            
            <h3 className="font-semibold text-base">7. Cookies e Tecnologias de Rastreamento</h3>
            <p>Podemos utilizar cookies e tecnologias semelhantes para:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Salvar preferências do usuário</li>
              <li>Melhorar a navegação no app</li>
              <li>Coletar dados estatísticos de uso</li>
            </ul>
            <p>
              Você pode desativar o uso de cookies nas configurações do seu dispositivo, porém
              isso pode impactar a experiência de uso.
            </p>
            
            <h3 className="font-semibold text-base">8. Alterações na Política</h3>
            <p>
              Esta Política pode ser atualizada a qualquer momento para refletir melhorias ou
              exigências legais. Recomendamos que você revise periodicamente.
            </p>
            
            <h3 className="font-semibold text-base">9. Contato</h3>
            <p>
              Em caso de dúvidas, reclamações ou solicitações sobre esta política, entre em
              contato: helpaquiapp@hotmail.com
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

export default PrivacyPolicyDialog;
