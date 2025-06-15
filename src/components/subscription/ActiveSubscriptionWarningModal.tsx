
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, X } from 'lucide-react';

interface ActiveSubscriptionWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlanName: string;
  newPlanName: string;
}

const ActiveSubscriptionWarningModal: React.FC<ActiveSubscriptionWarningModalProps> = ({
  isOpen,
  onClose,
  currentPlanName,
  newPlanName
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-orange-600 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 mr-2" />
            Plano Ativo Detectado
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-6">
          <div className="text-center mb-6">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-orange-800 mb-3">
                <strong>Você já possui um plano mensal ativo:</strong>
              </p>
              <p className="font-semibold text-orange-900 mb-3">{currentPlanName}</p>
              <p className="text-sm text-orange-800">
                Para assinar o plano <strong>{newPlanName}</strong>, você precisa primeiro cancelar seu plano atual.
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                💡 <strong>Dica:</strong> Você pode cancelar seu plano atual na seção "Status da Sua Assinatura" abaixo da lista de planos.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={onClose}
            className="px-8"
          >
            <X className="h-4 w-4 mr-2" />
            Entendi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ActiveSubscriptionWarningModal;
