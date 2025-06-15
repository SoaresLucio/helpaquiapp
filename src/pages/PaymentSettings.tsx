
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CreditCard, Wallet, PlusCircle, Building, AlertCircle, CheckCircle, ShieldCheck, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { saveBankDetails } from '@/services/paymentService';

interface PaymentMethod {
  id: string;
  method_type: string;
  card_last_four: string;
  card_brand: string;
  is_default: boolean;
  is_active: boolean;
}

interface BankDetails {
  id: string;
  bank_name: string;
  account_type: string;
  account_number: string;
  branch: string;
  document: string;
}

interface PaymentHistory {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  service_title?: string;
}

const PaymentSettings = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("payment-methods");
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Payment method states
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  
  // Bank account info
  const [bankInfo, setBankInfo] = useState({
    accountName: '',
    bankName: '',
    accountType: 'Corrente',
    accountNumber: '',
    branch: '',
    cpfCnpj: ''
  });
  
  // New card state
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
    saveCard: true
  });

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);

        // Load payment methods
        const { data: methodsData, error: methodsError } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('is_default', { ascending: false });

        if (methodsError) {
          console.error('Error loading payment methods:', methodsError);
        } else {
          setPaymentMethods(methodsData || []);
        }

        // Load bank details
        const { data: bankData, error: bankError } = await supabase
          .from('bank_details')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (bankError && bankError.code !== 'PGRST116') {
          console.error('Error loading bank details:', bankError);
        } else if (bankData) {
          setBankDetails(bankData);
          setBankInfo({
            accountName: bankData.bank_name,
            bankName: bankData.bank_name,
            accountType: bankData.account_type,
            accountNumber: bankData.account_number,
            branch: bankData.branch,
            cpfCnpj: bankData.document
          });
        }

        // Load payment history (payments made by this user)
        const { data: historyData, error: historyError } = await supabase
          .from('payments')
          .select('id, amount, status, created_at, service_title')
          .eq('client_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (historyError) {
          console.error('Error loading payment history:', historyError);
        } else {
          setPaymentHistory(historyData || []);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);
  
  // Function to add a new payment method
  const handleAddCard = async (event: React.FormEvent, onClose: () => void) => {
    event.preventDefault();
    
    if (!user?.id) return;
    
    setIsProcessing(true);
    
    try {
      const { error } = await supabase
        .from('payment_methods')
        .insert({
          user_id: user.id,
          method_type: 'credit_card',
          card_last_four: newCard.cardNumber.slice(-4),
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
      
      setNewCard({
        cardNumber: '',
        cardName: '',
        expiry: '',
        cvv: '',
        saveCard: true
      });
      
      toast({
        title: "Cartão adicionado",
        description: `O cartão terminado em ${newCard.cardNumber.slice(-4)} foi adicionado com sucesso.`,
      });
      
      onClose();
    } catch (error) {
      console.error('Error adding card:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o cartão.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Function to set a payment method as default
  const setDefaultPaymentMethod = async (id: string) => {
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

      setPaymentMethods(prev => 
        prev.map(method => ({
          ...method,
          is_default: method.id === id
        }))
      );
      
      toast({
        title: "Método padrão atualizado",
        description: "Seu método de pagamento padrão foi atualizado.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o método padrão.",
        variant: "destructive"
      });
    }
  };
  
  // Function to remove a payment method
  const removePaymentMethod = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      setPaymentMethods(prev => prev.filter(method => method.id !== id));
      
      toast({
        title: "Método removido",
        description: "O método de pagamento foi removido com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o método de pagamento.",
        variant: "destructive"
      });
    }
  };
  
  // Function to update bank information
  const handleUpdateBankInfo = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsProcessing(true);
    
    try {
      const success = await saveBankDetails({
        bankName: bankInfo.bankName,
        accountType: bankInfo.accountType,
        accountNumber: bankInfo.accountNumber,
        branch: bankInfo.branch,
        document: bankInfo.cpfCnpj
      });

      if (success) {
        toast({
          title: "Dados bancários atualizados",
          description: "Suas informações de pagamento foram atualizadas com sucesso.",
        });

        // Reload bank details
        const { data: bankData } = await supabase
          .from('bank_details')
          .select('*')
          .eq('user_id', user?.id)
          .maybeSingle();
        
        if (bankData) {
          setBankDetails(bankData);
        }
      } else {
        throw new Error('Failed to save bank details');
      }
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar as informações bancárias.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

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
  
  // Create a component for the add card form
  const AddCardForm = () => {
    return (
      <form onSubmit={(e) => {
        const closeDialog = () => {
          document.querySelector<HTMLButtonElement>('[data-id="close-add-card-dialog"]')?.click();
        };
        handleAddCard(e, closeDialog);
      }}>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="card-number">Número do cartão</Label>
            <Input 
              id="card-number" 
              placeholder="0000 0000 0000 0000"
              value={newCard.cardNumber}
              onChange={(e) => setNewCard({...newCard, cardNumber: e.target.value})}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="card-name">Nome no cartão</Label>
            <Input 
              id="card-name" 
              placeholder="Como aparece no cartão"
              value={newCard.cardName}
              onChange={(e) => setNewCard({...newCard, cardName: e.target.value})}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="card-expiry">Data de validade</Label>
              <Input 
                id="card-expiry" 
                placeholder="MM/AA"
                value={newCard.expiry}
                onChange={(e) => setNewCard({...newCard, expiry: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card-cvv">Código de segurança (CVV)</Label>
              <Input 
                id="card-cvv" 
                placeholder="123"
                type="password"
                maxLength={4}
                value={newCard.cvv}
                onChange={(e) => setNewCard({...newCard, cvv: e.target.value})}
                required
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="save-card" 
              checked={newCard.saveCard}
              onCheckedChange={(checked) => setNewCard({...newCard, saveCard: checked})}
            />
            <Label htmlFor="save-card">Salvar este cartão para pagamentos futuros</Label>
          </div>
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button data-id="close-add-card-dialog" type="button" variant="outline">Cancelar</Button>
          </DialogClose>
          <Button type="submit" disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>Adicionar cartão</>
            )}
          </Button>
        </DialogFooter>
      </form>
    );
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-helpaqui-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      
      <main className="flex-1 helpaqui-container py-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Pagamentos</h1>
          <p className="text-gray-600">
            Gerencie seus métodos de pagamento e configure suas preferências
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                  orientation="vertical"
                >
                  <TabsList className="flex flex-col h-auto w-full bg-transparent justify-start items-start p-0">
                    <TabsTrigger
                      value="payment-methods"
                      className="w-full justify-start px-4 py-3 border-l-2 border-transparent data-[state=active]:border-helpaqui-blue rounded-none"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Métodos de Pagamento
                    </TabsTrigger>
                    <TabsTrigger
                      value="bank-account"
                      className="w-full justify-start px-4 py-3 border-l-2 border-transparent data-[state=active]:border-helpaqui-blue rounded-none"
                    >
                      <Building className="h-4 w-4 mr-2" />
                      Dados Bancários
                    </TabsTrigger>
                    <TabsTrigger
                      value="transaction-history"
                      className="w-full justify-start px-4 py-3 border-l-2 border-transparent data-[state=active]:border-helpaqui-blue rounded-none"
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      Histórico de Transações
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Pagamento Seguro</CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="h-5 w-5 text-helpaqui-green mt-0.5" />
                  <p className="text-sm text-gray-600">
                    Todas as transações são protegidas por criptografia e seguem os padrões de segurança PCI.
                  </p>
                </div>
              </CardContent>
            </Card>

            {bankDetails && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-helpaqui-green" />
                    Dados Confirmados
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <p className="text-sm text-gray-600">
                    Seus dados bancários estão configurados e seguros.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsContent value="payment-methods">
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
                                  onClick={() => setDefaultPaymentMethod(method.id)}
                                >
                                  Definir como padrão
                                </Button>
                              )}
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => removePaymentMethod(method.id)}
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
                        
                        <AddCardForm />
                      </DialogContent>
                    </Dialog>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="bank-account">
                <Card>
                  <CardHeader>
                    <CardTitle>Dados Bancários</CardTitle>
                    <CardDescription>
                      Configure sua conta bancária para receber reembolsos ou pagamentos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdateBankInfo}>
                      <div className="grid gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="account-name">Nome do titular</Label>
                            <Input 
                              id="account-name" 
                              value={bankInfo.accountName}
                              onChange={(e) => setBankInfo({...bankInfo, accountName: e.target.value})}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bank-name">Banco</Label>
                            <Input 
                              id="bank-name" 
                              value={bankInfo.bankName}
                              onChange={(e) => setBankInfo({...bankInfo, bankName: e.target.value})}
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="account-type">Tipo de conta</Label>
                            <Select
                              value={bankInfo.accountType}
                              onValueChange={(value) => setBankInfo({...bankInfo, accountType: value})}
                            >
                              <SelectTrigger id="account-type">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Corrente">Conta Corrente</SelectItem>
                                <SelectItem value="Poupança">Conta Poupança</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="branch">Agência</Label>
                            <Input 
                              id="branch" 
                              value={bankInfo.branch}
                              onChange={(e) => setBankInfo({...bankInfo, branch: e.target.value})}
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="account-number">Número da conta</Label>
                            <Input 
                              id="account-number" 
                              value={bankInfo.accountNumber}
                              onChange={(e) => setBankInfo({...bankInfo, accountNumber: e.target.value})}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cpf-cnpj">CPF ou CNPJ</Label>
                            <Input 
                              id="cpf-cnpj" 
                              value={bankInfo.cpfCnpj}
                              onChange={(e) => setBankInfo({...bankInfo, cpfCnpj: e.target.value})}
                              required
                            />
                          </div>
                        </div>

                        {!bankDetails && (
                          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <AlertCircle className="h-4 w-4 text-blue-600" />
                            <p className="text-sm text-blue-800">
                              Configure seus dados bancários para facilitar reembolsos e outras transações.
                            </p>
                          </div>
                        )}
                        
                        <div className="pt-2">
                          <Button type="submit" className="w-full" disabled={isProcessing}>
                            {isProcessing ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Salvando...
                              </>
                            ) : (
                              <>
                                {bankDetails ? 'Atualizar dados bancários' : 'Salvar dados bancários'}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="transaction-history">
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
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentSettings;
