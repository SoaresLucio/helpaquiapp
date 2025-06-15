
import React from 'react';
import { Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PaymentHistory {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  service_title?: string;
}

interface TransactionHistoryTabProps {
  paymentHistory: PaymentHistory[];
}

const TransactionHistoryTab: React.FC<TransactionHistoryTabProps> = ({ paymentHistory }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

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
        <CardTitle>Histórico de Transações</CardTitle>
        <CardDescription>
          Veja todos os seus pagamentos realizados
        </CardDescription>
      </CardHeader>
      <CardContent>
        {paymentHistory.length === 0 ? (
          <div className="text-center py-8">
            <Wallet className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium">Nenhuma transação ainda</h3>
            <p className="mt-2 text-gray-500">
              Suas transações aparecerão aqui quando você começar a usar a plataforma.
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
                    Pago em {formatDate(payment.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-red-600">
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

export default TransactionHistoryTab;
