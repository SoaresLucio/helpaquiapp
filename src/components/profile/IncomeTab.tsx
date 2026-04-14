
import React from 'react';
import { DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface Income {
  id: number;
  date: string;
  description: string;
  amount: number;
}

const IncomeTab: React.FC = () => {
  // Mock income data
  const incomeData: Income[] = [
    { id: 1, date: '10/04/2023', description: 'Serviço de Limpeza', amount: 150.00 },
    { id: 2, date: '15/04/2023', description: 'Serviço de Jardinagem', amount: 200.00 },
    { id: 3, date: '22/04/2023', description: 'Conserto Elétrico', amount: 180.00 }
  ];

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Rendimentos</span>
            <span className="text-helpaqui-green text-xl">R$ 530,00</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {incomeData.length > 0 ? (
            <div className="divide-y">
              {incomeData.map(income => (
                <div key={income.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{income.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{income.date}</p>
                  </div>
                  <p className="font-medium text-helpaqui-green">R$ {income.amount.toFixed(2)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">Nenhum rendimento registrado</p>
          )}
          
          <Separator className="my-4" />
          
          <div className="flex justify-between items-center mt-2">
            <span className="font-medium">Disponível para saque:</span>
            <span className="text-helpaqui-green font-bold">R$ 530,00</span>
          </div>
          
          <Button className="w-full mt-4 flex items-center justify-center">
            <DollarSign className="mr-2 h-4 w-4" /> 
            Solicitar Saque
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncomeTab;
