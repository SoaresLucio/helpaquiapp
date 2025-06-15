
import React from 'react';
import { CreditCard, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PaymentMethod {
  id: string;
  method_type: string;
  card_last_four?: string;
  card_brand?: string;
  is_default: boolean;
  is_active: boolean;
}

interface PaymentMethodCardProps {
  method: PaymentMethod;
  onSetDefault: (id: string) => void;
  onRemove: (id: string) => void;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  method,
  onSetDefault,
  onRemove
}) => {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gray-100 rounded">
          {method.method_type === 'credit_card' ? (
            <CreditCard className="h-4 w-4" />
          ) : (
            <div className="w-4 h-4 bg-green-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">
              P
            </div>
          )}
        </div>
        <div>
          <p className="font-medium">
            {method.method_type === 'credit_card' ? 'Cartão de Crédito' : 'PIX'}
          </p>
          <p className="text-sm text-gray-500">
            {method.method_type === 'credit_card' 
              ? `${method.card_brand} **** ${method.card_last_four}`
              : `PIX **** ${method.card_last_four}`
            }
          </p>
        </div>
        {method.is_default && (
          <Badge variant="secondary" className="ml-2">
            <Check className="h-3 w-3 mr-1" />
            Padrão
          </Badge>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        {!method.is_default && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSetDefault(method.id)}
          >
            Definir como padrão
          </Button>
        )}
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onRemove(method.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PaymentMethodCard;
