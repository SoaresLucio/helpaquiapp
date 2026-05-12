import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface AddPaymentMethodDialogProps {
  onAddMethod?: unknown; // deprecated
}

const AddPaymentMethodDialog: React.FC<AddPaymentMethodDialogProps> = () => {
  const navigate = useNavigate();
  return (
    <div className="rounded-md border p-4 space-y-2">
      <p className="text-sm text-muted-foreground">
        Para adicionar um cartão, conclua uma assinatura via checkout seguro Asaas. O cartão será salvo automaticamente após a aprovação.
      </p>
      <Button variant="outline" className="w-full" onClick={() => navigate('/subscription')}>
        <ShieldCheck className="h-4 w-4 mr-2" />
        Ir para checkout seguro
      </Button>
    </div>
  );
};

export default AddPaymentMethodDialog;
