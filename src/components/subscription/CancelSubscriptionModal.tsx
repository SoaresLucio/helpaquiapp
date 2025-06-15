
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  planName: string;
  isLoading?: boolean;
}

const CancelSubscriptionModal: React.FC<CancelSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  planName,
  isLoading = false
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-red-600 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 mr-2" />
            Cancelar Assinatura
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-6">
          <div className="text-center mb-6">
            <p className="text-gray-700 mb-4">
              Tem certeza que deseja cancelar sua assinatura do plano <strong>{planName}</strong>?
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Atenção:</strong> Ao cancelar, você perderá o acesso aos benefícios do plano ao final do período atual.
              </p>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            Manter Assinatura
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Cancelando...
              </>
            ) : (
              'Sim, Cancelar'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CancelSubscriptionModal;
