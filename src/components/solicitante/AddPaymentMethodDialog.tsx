
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

interface NewMethod {
  type: 'card' | 'pix';
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
  pixKey: string;
  pixType: string;
}

interface AddPaymentMethodDialogProps {
  onAddMethod: (method: NewMethod) => Promise<boolean>;
}

const AddPaymentMethodDialog: React.FC<AddPaymentMethodDialogProps> = ({ onAddMethod }) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMethod, setNewMethod] = useState<NewMethod>({
    type: 'card',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    pixKey: '',
    pixType: 'email'
  });

  const handleAddPaymentMethod = async () => {
    const success = await onAddMethod(newMethod);
    
    if (success) {
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
    }
  };

  return (
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
  );
};

export default AddPaymentMethodDialog;
