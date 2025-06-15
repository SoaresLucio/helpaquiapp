
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, MessageCircle, CreditCard, Users, Settings, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Ações Rápidas
        </CardTitle>
        <CardDescription>
          Acesse rapidamente as funcionalidades principais
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            onClick={() => navigate('/chat')}
            className="bg-helpaqui-blue hover:bg-helpaqui-blue/90 h-16 flex flex-col gap-1"
          >
            <MessageCircle className="h-5 w-5" />
            Chat & Mensagens
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/my-requests')}
            className="h-16 flex flex-col gap-1 bg-blue-50 hover:bg-blue-100 border-blue-200"
          >
            <Settings className="h-5 w-5" />
            Meus Pedidos
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/payment-settings')}
            className="h-16 flex flex-col gap-1"
          >
            <CreditCard className="h-5 w-5" />
            Pagamentos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
