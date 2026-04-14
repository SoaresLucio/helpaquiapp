
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet } from 'lucide-react';

interface PaymentHistory {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  service_title?: string;
}

interface PaymentHistoryListProps {
  paymentHistory: PaymentHistory[];
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
}

const PaymentHistoryList: React.FC<PaymentHistoryListProps> = ({
  paymentHistory,
  formatCurrency,
  formatDate
}) => {
  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'Pendente', variant: 'secondary' as const },
      processing: { label: 'Processando', variant: 'default' as const },
      completed: { label: 'Concluído', variant: 'default' as const },
      cancelled: { label: 'Cancelado', variant: 'destructive' as const }
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    
    return (
      <Badge variant={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Recebimentos</CardTitle>
        <CardDescription>
          Veja todos os pagamentos que você recebeu
        </CardDescription>
      </CardHeader>
      <CardContent>
        {paymentHistory.length === 0 ? (
          <div className="text-center py-8">
            <Wallet className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium">Nenhum recebimento ainda</h3>
            <p className="mt-2 text-gray-500">
              Seus recebimentos aparecerão aqui quando você começar a prestar serviços.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentHistory.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">
                      {payment.service_title || 'Serviço'}
                    </h4>
                    {getStatusBadge(payment.status)}
                  </div>
                  <p className="text-sm text-gray-500">
                    Recebido em {formatDate(payment.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-helpaqui-green">
                    {formatCurrency(payment.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentHistoryList;
