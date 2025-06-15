
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CreditCard } from 'lucide-react';

const ProfileActions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="px-4 pb-4">
      <Button 
        onClick={() => navigate('/payment-freelancer-settings')}
        className="w-full bg-helpaqui-green hover:bg-helpaqui-green/90 flex items-center justify-center gap-2"
      >
        <CreditCard className="h-4 w-4" />
        Configurações de Pagamento
      </Button>
    </div>
  );
};

export default ProfileActions;
