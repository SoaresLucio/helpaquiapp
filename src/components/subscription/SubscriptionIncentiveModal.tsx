
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SubscriptionIncentiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  userType: 'solicitante' | 'freelancer';
}

const SubscriptionIncentiveModal: React.FC<SubscriptionIncentiveModalProps> = ({
  isOpen,
  onClose,
  userType
}) => {
  const navigate = useNavigate();

  const handleViewPlans = () => {
    if (userType === 'solicitante') {
      navigate('/solicitante-plans');
    } else {
      navigate('/freelancer-plans');
    }
    onClose();
  };

  const handleSkip = () => {
    // Salvar no localStorage que o usuário pulou para não mostrar novamente na sessão
    localStorage.setItem('subscription-modal-skipped', 'true');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="relative">
          <button
            onClick={onClose}
            className="absolute right-0 top-0 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          
          <DialogTitle className="text-xl font-bold text-center">
            Assine um plano mensal!
          </DialogTitle>
          
          <DialogDescription className="text-center text-gray-600">
            Assine um plano e tenha acesso exclusivo a serviços premium.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4">
          {/* Imagem ilustrativa */}
          <div className="w-full max-w-xs">
            <img 
              src="/lovable-uploads/9b5279a0-dbae-4bbc-826f-dd9a9093c839.png" 
              alt="Ilustração de pessoas se cumprimentando"
              className="w-full h-auto rounded-lg"
            />
          </div>

          {/* Botões de ação */}
          <div className="flex flex-col w-full space-y-3">
            <Button 
              onClick={handleViewPlans}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3"
            >
              Ver Planos
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleSkip}
              className="w-full text-gray-600 border-gray-300 hover:bg-gray-50"
            >
              Pular por agora
            </Button>
          </div>

          {/* Benefícios resumidos */}
          <div className="text-xs text-gray-500 text-center mt-2">
            {userType === 'solicitante' ? (
              'Acesso ilimitado a profissionais qualificados'
            ) : (
              'Receba mais oportunidades de trabalho'
            }
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionIncentiveModal;
