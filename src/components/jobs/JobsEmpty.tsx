
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

const JobsEmpty: React.FC = () => {
  return (
    <Card className="text-center py-12">
      <CardContent>
        <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma vaga disponível</h3>
        <p className="text-gray-600">Não há vagas de emprego disponíveis no momento. Volte em breve!</p>
      </CardContent>
    </Card>
  );
};

export default JobsEmpty;
