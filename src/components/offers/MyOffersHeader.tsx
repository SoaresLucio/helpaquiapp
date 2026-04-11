
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const MyOffersHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Minhas Ofertas de Ajuda</h1>
        <p className="text-gray-600">Gerencie todas as suas ofertas de serviço</p>
      </div>
      
      <Button 
        onClick={() => navigate('/dashboard')}
        className="bg-secondary hover:bg-secondary/90"
      >
        Nova Oferta
      </Button>
    </div>
  );
};

export default MyOffersHeader;
