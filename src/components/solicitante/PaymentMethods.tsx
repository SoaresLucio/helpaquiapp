
import React from 'react';
import { CreditCard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import PaymentMethodCard from './PaymentMethodCard';
import AddPaymentMethodDialog from './AddPaymentMethodDialog';

const PaymentMethods: React.FC = () => {
  const { paymentMethods, loading, addPaymentMethod, removeMethod, setDefaultMethod } = usePaymentMethods();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Métodos de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-helpaqui-purple"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          Métodos de Pagamento
        </CardTitle>
        <CardDescription>
          Gerencie seus métodos de pagamento para facilitar as transações
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {paymentMethods.map(method => (
          <PaymentMethodCard
            key={method.id}
            method={method}
            onSetDefault={setDefaultMethod}
            onRemove={removeMethod}
          />
        ))}

        {paymentMethods.length === 0 && (
          <div className="text-center py-8">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium">Nenhum método de pagamento</h3>
            <p className="mt-2 text-gray-500">
              Você ainda não adicionou nenhum método de pagamento.
            </p>
          </div>
        )}

        <AddPaymentMethodDialog onAddMethod={addPaymentMethod} />
      </CardContent>
    </Card>
  );
};

export default PaymentMethods;
