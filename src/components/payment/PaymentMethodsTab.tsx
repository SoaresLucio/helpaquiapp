import React from 'react';
import { CreditCard, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

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
  onAddCard?: unknown; // deprecated, kept for backward-compat
  onSetDefault: (id: string) => void;
  onRemove: (id: string) => void;
  isProcessing: boolean;
}

const PaymentMethodsTab: React.FC<PaymentMethodsTabProps> = ({
  paymentMethods,
  onSetDefault,
  onRemove,
}) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métodos de Pagamento</CardTitle>
        <CardDescription>
          Seus cartões são salvos com segurança após o pagamento via checkout protegido (Asaas). Por questões de segurança e conformidade PCI, não coletamos dados de cartão diretamente neste app.
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        {paymentMethods.length > 0 ? (
          <div className="space-y-4">
            {paymentMethods.map(method => (
              <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {method.card_brand?.toUpperCase() || 'CARTÃO'} **** {method.card_last_four}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {method.method_type.replace('_', ' ')}
                    </p>
                  </div>
                  {method.is_default && (
                    <Badge variant="outline" className="ml-2">Padrão</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!method.is_default && (
                    <Button variant="ghost" size="sm" onClick={() => onSetDefault(method.id)}>
                      Definir como padrão
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => onRemove(method.id)}>
                    Remover
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Nenhum método de pagamento</h3>
            <p className="mt-2 text-muted-foreground">
              Cartões serão registrados automaticamente após sua primeira assinatura via checkout seguro.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2">
        <Button onClick={() => navigate('/subscription')}>
          <ShieldCheck className="mr-2 h-4 w-4" />
          Assinar via checkout seguro
        </Button>
        <p className="text-xs text-muted-foreground">
          Você será redirecionado para o ambiente certificado PCI da Asaas para informar os dados do cartão.
        </p>
      </CardFooter>
    </Card>
  );
};

export default PaymentMethodsTab;
