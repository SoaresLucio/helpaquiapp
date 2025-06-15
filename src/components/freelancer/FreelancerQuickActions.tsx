
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Calendar, CreditCard, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FreelancerQuickActions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Briefcase className="h-5 w-5 mr-2" />
          Ações Rápidas
        </CardTitle>
        <CardDescription>
          Acesse rapidamente as funcionalidades principais
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button 
            onClick={() => navigate('/jobs')}
            className="bg-helpaqui-green hover:bg-helpaqui-green/90 h-16 flex flex-col gap-1"
          >
            <Briefcase className="h-5 w-5" />
            Ver Trabalhos
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/chat')}
            className="h-16 flex flex-col gap-1"
          >
            <Calendar className="h-5 w-5" />
            Mensagens
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/payments')}
            className="h-16 flex flex-col gap-1 bg-blue-50 hover:bg-blue-100 border-blue-200"
          >
            <CreditCard className="h-5 w-5" />
            Pagamentos
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/profile')}
            className="h-16 flex flex-col gap-1"
          >
            <Users className="h-5 w-5" />
            Meu Perfil
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FreelancerQuickActions;
