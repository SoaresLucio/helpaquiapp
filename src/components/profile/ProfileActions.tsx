
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ProfileActions: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-center mb-6">
      <Button 
        onClick={() => navigate('/payment-freelancer-settings')}
        className="bg-helpaqui-green hover:bg-helpaqui-green/90"
      >
        <CreditCard className="h-4 w-4 mr-2" />
        Configurações de Pagamento
      </Button>
    </div>
  );
};

export default ProfileActions;
