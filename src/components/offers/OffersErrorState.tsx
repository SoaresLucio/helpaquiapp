
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface OffersErrorStateProps {
  error: string;
  onRetry: () => void;
}

const OffersErrorState: React.FC<OffersErrorStateProps> = ({ error, onRetry }) => {
  return (
    <Card className="mx-auto max-w-md">
      <CardContent className="pt-6 text-center">
        <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Erro ao carregar ofertas</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={onRetry} variant="outline">
          Tentar novamente
        </Button>
      </CardContent>
    </Card>
  );
};

export default OffersErrorState;
