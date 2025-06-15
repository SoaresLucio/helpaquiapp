
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';

const ServiceRequestsEmpty: React.FC = () => {
  return (
    <Card className="text-center py-12">
      <CardContent>
        <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma solicitação encontrada</h3>
        <p className="text-gray-600">
          Não há pedidos de help disponíveis no momento com os filtros selecionados. 
          Tente ajustar os filtros ou volte em breve!
        </p>
      </CardContent>
    </Card>
  );
};

export default ServiceRequestsEmpty;
