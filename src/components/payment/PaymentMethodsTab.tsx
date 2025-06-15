
import React from 'react';
import { CreditCard, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AddCardForm from './AddCardForm';

interface PaymentMethod {
  id: string;
  method_type: string;
  card_last_four: string;
  card_brand: string;
  is_default: boolean;
  is_active: boolean;
}

interface PaymentMethodsTabProps {
  paymentMethods: PaymentMethod[];
  onAddCard: (cardData: { cardNumber: string; cardName: string; expiry: string; cvv: string; }) => Promise<boolean>;
  onSetDefault: (id: string) => void;
  onRemove: (id: string) => void;
  isProcessing: boolean;
}

const PaymentMethodsTab: React.FC<PaymentMethodsTabProps> = ({
  paymentMethods,
  onAddCard,
  onSetDefault,
  onRemove,
  isProcessing
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Métodos de Pagamento</CardTitle>
        <CardDescription>
          Adicione e gerencie seus cartões e outras formas de pagamento
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        {paymentMethods.length > 0 ? (
          <div className="space-y-4">
            {paymentMethods.map(method => (
              <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center">
                    {method.card_brand === 'visa' ? (
                      <span className="text-blue-700 font-bold">VISA</span>
                    ) : (
                      <span className="text-red-600 font-bold">MC</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {method.card_brand?.toUpperCase()} **** {method.card_last_four}
                    </p>
                    <p className="text-sm text-gray-500 capitalize">
                      {method.method_type.replace('_', ' ')}
                    </p>
                  </div>
                  {method.is_default && (
                    <Badge variant="outline" className="ml-2">Padrão</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!method.is_default && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onSetDefault(method.id)}
                    >
                      Definir como padrão
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onRemove(method.id)}
                  >
                    Remover
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium">Nenhum método de pagamento</h3>
            <p className="mt-2 text-gray-500">
              Você ainda não adicionou nenhum método de pagamento.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar cartão
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar novo cartão</DialogTitle>
              <DialogDescription>
                Adicione um novo cartão de crédito ou débito à sua conta.
              </DialogDescription>
            </DialogHeader>
            <AddCardForm onAddCard={onAddCard} isProcessing={isProcessing} />
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default PaymentMethodsTab;
