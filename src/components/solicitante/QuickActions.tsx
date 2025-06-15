
import React from 'react';
import { Search, CreditCard, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
        <CardDescription>
          Acesse rapidamente as funcionalidades principais
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="outline"
            onClick={() => navigate('/jobs')}
            className="h-16 flex flex-col gap-1"
          >
            <Search className="h-5 w-5" />
            Buscar Serviços
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
            <Clock className="h-5 w-5" />
            Meu Perfil
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
