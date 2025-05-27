
import React, { useState } from 'react';
import { CreditCard, Plus, Trash2, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

interface PaymentMethod {
  id: string;
  type: 'card' | 'pix';
  name: string;
  details: string;
  isDefault: boolean;
}

const PaymentMethods: React.FC = () => {
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      name: 'Cartão de Crédito',
      details: '**** **** **** 1234',
      isDefault: true
    },
    {
      id: '2',
      type: 'pix',
      name: 'PIX',
      details: 'joao@email.com',
      isDefault: false
    }
  ]);

  const [newMethod, setNewMethod] = useState({
    type: 'card' as 'card' | 'pix',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    pixKey: '',
    pixType: 'email'
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddPaymentMethod = () => {
    if (newMethod.type === 'card') {
      if (!newMethod.cardNumber || !newMethod.cardName || !newMethod.expiryDate || !newMethod.cvv) {
        toast({
          title: "Erro",
          description: "Preencha todos os campos do cartão",
          variant: "destructive"
        });
        return;
      }

      const maskedNumber = `**** **** **** ${newMethod.cardNumber.slice(-4)}`;
      const method: PaymentMethod = {
        id: Date.now().toString(),
        type: 'card',
        name: 'Cartão de Crédito',
        details: maskedNumber,
        isDefault: paymentMethods.length === 0
      };

      setPaymentMethods([...paymentMethods, method]);
    } else {
      if (!newMethod.pixKey) {
        toast({
          title: "Erro",
          description: "Preencha a chave PIX",
          variant: "destructive"
        });
        return;
      }

      const method: PaymentMethod = {
        id: Date.now().toString(),
        type: 'pix',
        name: 'PIX',
        details: newMethod.pixKey,
        isDefault: paymentMethods.length === 0
      };

      setPaymentMethods([...paymentMethods, method]);
    }

    setNewMethod({
      type: 'card',
      cardNumber: '',
      cardName: '',
      expiryDate: '',
      cvv: '',
      pixKey: '',
      pixType: 'email'
    });

    setIsDialogOpen(false);
    
    toast({
      title: "Método adicionado",
      description: "Método de pagamento adicionado com sucesso"
    });
  };

  const handleRemoveMethod = (id: string) => {
    setPaymentMethods(methods => methods.filter(m => m.id !== id));
    toast({
      title: "Método removido",
      description: "Método de pagamento removido com sucesso"
    });
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(methods => 
      methods.map(m => ({ ...m, isDefault: m.id === id }))
    );
    toast({
      title: "Método padrão alterado",
      description: "Método de pagamento padrão alterado com sucesso"
    });
  };

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
          <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded">
                {method.type === 'card' ? (
                  <CreditCard className="h-4 w-4" />
                ) : (
                  <div className="w-4 h-4 bg-green-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">
                    P
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium">{method.name}</p>
                <p className="text-sm text-gray-500">{method.details}</p>
              </div>
              {method.isDefault && (
                <Badge variant="secondary" className="ml-2">
                  <Check className="h-3 w-3 mr-1" />
                  Padrão
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {!method.isDefault && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSetDefault(method.id)}
                >
                  Definir como padrão
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRemoveMethod(method.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Método de Pagamento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Método de Pagamento</DialogTitle>
              <DialogDescription>
                Escolha o tipo de pagamento que deseja adicionar
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Tipo de Pagamento</Label>
                <Select 
                  value={newMethod.type} 
                  onValueChange={(value: 'card' | 'pix') => 
                    setNewMethod({ ...newMethod, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">Cartão de Crédito</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newMethod.type === 'card' ? (
                <>
                  <div>
                    <Label>Número do Cartão</Label>
                    <Input
                      placeholder="1234 5678 9012 3456"
                      value={newMethod.cardNumber}
                      onChange={(e) => setNewMethod({ ...newMethod, cardNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Nome no Cartão</Label>
                    <Input
                      placeholder="João Silva"
                      value={newMethod.cardName}
                      onChange={(e) => setNewMethod({ ...newMethod, cardName: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Data de Validade</Label>
                      <Input
                        placeholder="MM/AA"
                        value={newMethod.expiryDate}
                        onChange={(e) => setNewMethod({ ...newMethod, expiryDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>CVV</Label>
                      <Input
                        placeholder="123"
                        value={newMethod.cvv}
                        onChange={(e) => setNewMethod({ ...newMethod, cvv: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label>Tipo de Chave PIX</Label>
                    <Select 
                      value={newMethod.pixType} 
                      onValueChange={(value) => setNewMethod({ ...newMethod, pixType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Telefone</SelectItem>
                        <SelectItem value="cpf">CPF</SelectItem>
                        <SelectItem value="random">Chave Aleatória</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Chave PIX</Label>
                    <Input
                      placeholder={
                        newMethod.pixType === 'email' ? 'seu@email.com' :
                        newMethod.pixType === 'phone' ? '(11) 99999-9999' :
                        newMethod.pixType === 'cpf' ? '000.000.000-00' :
                        'chave-aleatoria-uuid'
                      }
                      value={newMethod.pixKey}
                      onChange={(e) => setNewMethod({ ...newMethod, pixKey: e.target.value })}
                    />
                  </div>
                </>
              )}

              <Button onClick={handleAddPaymentMethod} className="w-full">
                Adicionar Método
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default PaymentMethods;
