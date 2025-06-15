import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { saveBankDetails, getBankDetails } from '@/services/paymentService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface BankDetails {
  id: string;
  bank_name: string;
  account_type: string;
  account_number: string;
  branch: string;
  document: string;
}

interface PaymentMethod {
  id: string;
  method_type: string;
  card_last_four?: string;
  card_brand?: string;
  is_default: boolean;
  is_active: boolean;
}

const BankTab: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    bankName: '',
    accountType: '',
    accountNumber: '',
    branch: '',
    document: ''
  });

  // Load existing bank details and payment methods
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;

      try {
        setInitialLoading(true);
        
        // Load bank details using the new decrypted function
        const bankData = await getBankDetails();
        if (bankData) {
          setBankDetails(bankData);
          setFormData({
            bankName: bankData.bank_name,
            accountType: bankData.account_type,
            accountNumber: bankData.account_number,
            branch: bankData.branch,
            document: bankData.document
          });
        }

        // Load payment methods
        const { data: paymentData, error: paymentError } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('is_default', { ascending: false });

        if (paymentError) {
          console.error('Error loading payment methods:', paymentError);
        } else {
          setPaymentMethods(paymentData || []);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados financeiros.",
          variant: "destructive"
        });
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, [user, toast]);

  const handleBankDetailsSubmit = async () => {
    if (!formData.bankName || !formData.accountType || !formData.accountNumber || !formData.branch || !formData.document) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos bancários.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const success = await saveBankDetails({
        bankName: formData.bankName,
        accountType: formData.accountType,
        accountNumber: formData.accountNumber,
        branch: formData.branch,
        document: formData.document
      });
      
      if (success) {
        toast({
          title: "Dados bancários salvos",
          description: "Seus dados bancários foram atualizados com sucesso."
        });
        
        // Reload bank details using the new decrypted function
        const bankData = await getBankDetails();
        if (bankData) {
          setBankDetails(bankData);
        }
      } else {
        throw new Error('Failed to save bank details');
      }
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar os dados bancários.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addPaymentMethod = async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('payment_methods')
        .insert({
          user_id: user.id,
          method_type: 'credit_card',
          card_last_four: '****',
          card_brand: 'Visa',
          is_default: paymentMethods.length === 0
        });

      if (error) throw error;

      toast({
        title: "Método de pagamento adicionado",
        description: "Novo cartão foi adicionado com sucesso."
      });

      // Reload payment methods
      const { data: paymentData } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('is_default', { ascending: false });

      setPaymentMethods(paymentData || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o método de pagamento.",
        variant: "destructive"
      });
    }
  };

  const removePaymentMethod = async (methodId: string) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_active: false })
        .eq('id', methodId);

      if (error) throw error;

      setPaymentMethods(prev => prev.filter(method => method.id !== methodId));
      
      toast({
        title: "Método removido",
        description: "Método de pagamento foi removido com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o método de pagamento.",
        variant: "destructive"
      });
    }
  };

  if (initialLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-helpaqui-blue"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Dados Bancários
            {bankDetails && (
              <Badge variant="outline" className="text-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Configurado
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="bank-name" className="block text-sm font-medium">Nome do Banco</label>
            <Input
              id="bank-name"
              placeholder="Ex: Banco do Brasil"
              value={formData.bankName}
              onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
              className="dark:bg-gray-800"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="account-type" className="block text-sm font-medium">Tipo de Conta</label>
            <Input
              id="account-type"
              placeholder="Ex: Corrente, Poupança"
              value={formData.accountType}
              onChange={(e) => setFormData(prev => ({ ...prev, accountType: e.target.value }))}
              className="dark:bg-gray-800"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="account-number" className="block text-sm font-medium">Número da Conta</label>
              <Input
                id="account-number"
                placeholder="Ex: 12345-6"
                value={formData.accountNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                className="dark:bg-gray-800"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="branch" className="block text-sm font-medium">Agência</label>
              <Input
                id="branch"
                placeholder="Ex: 0001"
                value={formData.branch}
                onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))}
                className="dark:bg-gray-800"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="document" className="block text-sm font-medium">CPF/CNPJ</label>
            <Input
              id="document"
              placeholder="Ex: 123.456.789-00"
              value={formData.document}
              onChange={(e) => setFormData(prev => ({ ...prev, document: e.target.value }))}
              className="dark:bg-gray-800"
            />
          </div>
          
          {!bankDetails && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                Configure seus dados bancários para poder receber pagamentos.
              </p>
            </div>
          )}
          
          <Button 
            onClick={handleBankDetailsSubmit} 
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Salvando...' : bankDetails ? 'Atualizar Dados Bancários' : 'Salvar Dados Bancários'}
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Métodos de Pagamento
            <Button onClick={addPaymentMethod} size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Adicionar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paymentMethods.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
              <p className="text-sm text-gray-500 mt-4">
                Nenhum método de pagamento cadastrado
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Adicione cartões ou PIX para facilitar seus pagamentos
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium capitalize">
                        {method.card_brand} **** {method.card_last_four}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        {method.method_type.replace('_', ' ')}
                        {method.is_default && ' (Padrão)'}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => removePaymentMethod(method.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BankTab;
