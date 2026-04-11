
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmptyOffersState: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardContent className="py-12 text-center">
        <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhuma oferta criada
        </h3>
        <p className="text-gray-500 mb-4">
          Você ainda não criou nenhuma oferta de ajuda.
        </p>
        <Button 
          onClick={() => navigate('/dashboard')}
          className="bg-helpaqui-green hover:bg-helpaqui-green/90"
        >
          Criar Primeira Oferta
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyOffersState;
