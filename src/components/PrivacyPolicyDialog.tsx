
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
      <DialogContent className="max-w-3xl max-h-[80vh] bg-white border border-gray-200 shadow-2xl z-[100]">
        <DialogHeader className="border-b border-gray-100 pb-4">
          <DialogTitle className="text-xl font-bold text-gray-900">Política de Privacidade – HelpAqui!</DialogTitle>
          <DialogDescription className="text-gray-600">
            Última atualização: 05/04/2025
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[50vh] pr-4 bg-white">
          <div className="space-y-4 text-sm text-gray-700 bg-white p-2">
            <p className="leading-relaxed">
              A sua privacidade é importante para nós. Esta Política de Privacidade descreve como
              coletamos, usamos, armazenamos e protegemos as suas informações no aplicativo
              HelpAqui!. Ao utilizar nossos serviços, você concorda com os termos aqui descritos.
            </p>
            
            <h3 className="font-semibold text-base text-gray-900 mt-6">1. Coleta de Dados Pessoais</h3>
            <p className="leading-relaxed">Durante o uso do app, coletamos os seguintes dados:</p>
            <ul className="list-disc pl-5 space-y-2 leading-relaxed">
              <li>Nome completo</li>
              <li>CPF e/ou RG</li>
              <li>Endereço de e-mail</li>
              <li>Número de telefone</li>
              <li>Endereço de residência e localização (via GPS)</li>
              <li>Dados bancários para repasses (ajudantes)</li>
              <li>Histórico de uso do aplicativo (tarefas realizadas/solicitadas, avaliações)</li>
              <li>Documentação para verificação (como antecedentes criminais)</li>
            </ul>
            <p className="leading-relaxed">Essas informações são necessárias para garantir a segurança e o funcionamento da plataforma.</p>
            
            <h3 className="font-semibold text-base text-gray-900 mt-6">2. Uso das Informações</h3>
            <p className="leading-relaxed">Utilizamos seus dados para:</p>
            <ul className="list-disc pl-5 space-y-2 leading-relaxed">
              <li>Criar e gerenciar sua conta</li>
              <li>Verificar sua identidade e histórico (quando necessário)</li>
              <li>Processar pagamentos e repasses</li>
              <li>Localizar tarefas e usuários próximos via geolocalização</li>
              <li>Enviar notificações importantes e operacionais</li>
              <li>Melhorar a experiência de uso no app</li>
              <li>Garantir a segurança da comunidade</li>
            </ul>
            
            <h3 className="font-semibold text-base text-gray-900 mt-6">3. Compartilhamento de Dados</h3>
            <p className="leading-relaxed">Seus dados poderão ser compartilhados apenas:</p>
            <ul className="list-disc pl-5 space-y-2 leading-relaxed">
              <li>Com outros usuários, quando necessário para realização da tarefa</li>
              <li>Com autoridades públicas, mediante requisição legal</li>
              <li>Com parceiros responsáveis por processar pagamentos e segurança</li>
            </ul>
            <p className="leading-relaxed">Jamais vendemos ou comercializamos seus dados pessoais.</p>
            
            <h3 className="font-semibold text-base text-gray-900 mt-6">4. Armazenamento e Segurança dos Dados</h3>
            <p className="leading-relaxed">
              Seus dados são armazenados em servidores seguros, com criptografia e proteção
              contra acessos não autorizados. Utilizamos práticas recomendadas de segurança digital.
            </p>
            
            <h3 className="font-semibold text-base text-gray-900 mt-6">5. Direitos do Usuário (LGPD)</h3>
            <p className="leading-relaxed">Você tem o direito de:</p>
            <ul className="list-disc pl-5 space-y-2 leading-relaxed">
              <li>Confirmar a existência de tratamento de dados</li>
              <li>Acessar, corrigir ou excluir seus dados pessoais</li>
              <li>Revogar o consentimento a qualquer momento</li>
              <li>Solicitar a portabilidade dos seus dados</li>
            </ul>
            
            <h3 className="font-semibold text-base text-gray-900 mt-6">6. Contato</h3>
            <p className="leading-relaxed">
              Em caso de dúvidas, reclamações ou solicitações sobre esta política, entre em
              contato: helpaquiapp@hotmail.com
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
              className="flex-1 bg-helpaqui-blue hover:bg-helpaqui-blue/90"
            >
              Aceitar Política
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyPolicyDialog;
