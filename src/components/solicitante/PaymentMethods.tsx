
import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Trash2, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PaymentMethod {
  id: string;
  method_type: string;
  card_last_four?: string;
  card_brand?: string;
  is_default: boolean;
  is_active: boolean;
}

const PaymentMethods: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Load existing payment methods
  useEffect(() => {
    const loadPaymentMethods = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('is_default', { ascending: false });

        if (error) {
          console.error('Error loading payment methods:', error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar os métodos de pagamento.",
            variant: "destructive"
          });
        } else {
          setPaymentMethods(data || []);
        }
      } catch (error) {
        console.error('Error loading payment methods:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPaymentMethods();
  }, [user, toast]);

  const handleAddPaymentMethod = async () => {
    if (!user?.id) return;

    if (newMethod.type === 'card') {
      if (!newMethod.cardNumber || !newMethod.cardName || !newMethod.expiryDate || !newMethod.cvv) {
        toast({
          title: "Erro",
          description: "Preencha todos os campos do cartão",
          variant: "destructive"
        });
        return;
      }

      try {
        const { error } = await supabase
          .from('payment_methods')
          .insert({
            user_id: user.id,
            method_type: 'credit_card',
            card_last_four: newMethod.cardNumber.slice(-4),
            card_brand: 'visa', // In a real app, you'd detect this from the card number
            is_default: paymentMethods.length === 0
          });

        if (error) throw error;

        // Reload payment methods
        const { data: updatedMethods } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('is_default', { ascending: false });

        setPaymentMethods(updatedMethods || []);
      } catch (error) {
        console.error('Error adding payment method:', error);
        toast({
          title: "Erro",
          description: "Não foi possível adicionar o método de pagamento.",
          variant: "destructive"
        });
        return;
      }
    } else {
      if (!newMethod.pixKey) {
        toast({
          title: "Erro",
          description: "Preencha a chave PIX",
          variant: "destructive"
        });
        return;
      }

      try {
        const { error } = await supabase
          .from('payment_methods')
          .insert({
            user_id: user.id,
            method_type: 'pix',
            card_last_four: newMethod.pixKey.slice(-4),
            card_brand: 'pix',
            is_default: paymentMethods.length === 0
          });

        if (error) throw error;

        // Reload payment methods
        const { data: updatedMethods } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('is_default', { ascending: false });

        setPaymentMethods(updatedMethods || []);
      } catch (error) {
        console.error('Error adding payment method:', error);
        toast({
          title: "Erro",
          description: "Não foi possível adicionar o método de pagamento.",
          variant: "destructive"
        });
        return;
      }
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

  const handleRemoveMethod = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      setPaymentMethods(methods => methods.filter(m => m.id !== id));
      
      toast({
        title: "Método removido",
        description: "Método de pagamento removido com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o método de pagamento.",
        variant: "destructive"
      });
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      // First, remove default from all methods
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', user?.id);

      // Then set the selected method as default
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;

      setPaymentMethods(methods => 
        methods.map(m => ({ ...m, is_default: m.id === id }))
      );
      
      toast({
        title: "Método padrão alterado",
        description: "Método de pagamento padrão alterado com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível alterar o método padrão.",
        variant: "destructive"
      });
    }
  };

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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-helpaqui-blue"></div>
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
          <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
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

        {paymentMethods.length === 0 && (
          <div className="text-center py-8">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium">Nenhum método de pagamento</h3>
            <p className="mt-2 text-gray-500">
              Você ainda não adicionou nenhum método de pagamento.
            </p>
          </div>
        )}

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
