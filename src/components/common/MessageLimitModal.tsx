
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MessageLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
  messagesUsed: number;
  messagesLimit: number;
  userType: 'freelancer' | 'solicitante';
}

const MessageLimitModal: React.FC<MessageLimitModalProps> = ({
  isOpen,
  onClose,
  currentPlan,
  messagesUsed,
  messagesLimit,
  userType
}) => {
  const navigate = useNavigate();

  const getUpgradeMessage = () => {
    if (currentPlan === 'Help Bronze') {
      return {
        title: 'Limite de Mensagens Atingido',
        description: `Você utilizou ${messagesUsed} de ${messagesLimit} conversas permitidas no plano ${currentPlan}.`,
        suggestion: 'Assine o plano Help Prata ou Ouro para continuar conversando com novos profissionais.',
        recommendedPlan: 'Help Prata'
      };
    } else if (currentPlan === 'Help Prata') {
      return {
        title: 'Limite de Mensagens Atingido',
        description: `Você utilizou ${messagesUsed} de ${messagesLimit} conversas permitidas no plano ${currentPlan}.`,
        suggestion: 'Assine o plano Help Ouro para mensagens ilimitadas.',
        recommendedPlan: 'Help Ouro'
      };
    }
    
    return {
      title: 'Limite Atingido',
      description: 'Você atingiu o limite do seu plano atual.',
      suggestion: 'Considere fazer upgrade para ter mais recursos.',
      recommendedPlan: 'Help Ouro'
    };
  };

  const handleUpgrade = () => {
    const planPage = userType === 'freelancer' ? '/freelancer-plans' : '/solicitante-plans';
    navigate(planPage);
    onClose();
  };

  const upgradeInfo = getUpgradeMessage();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-red-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            {upgradeInfo.title}
          </DialogTitle>
          <DialogDescription className="space-y-3">
            <p>{upgradeInfo.description}</p>
            <p className="text-sm text-gray-600">{upgradeInfo.suggestion}</p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm font-medium text-yellow-800">
                💡 Dica: Com o plano {upgradeInfo.recommendedPlan}, você pode conversar com mais profissionais e acessar recursos exclusivos!
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-3 mt-6">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1"
          >
            Fechar
          </Button>
          <Button 
            onClick={handleUpgrade}
            className="flex-1 bg-helpaqui-blue hover:bg-blue-700"
          >
            <Crown className="h-4 w-4 mr-2" />
            Ver Planos
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessageLimitModal;
