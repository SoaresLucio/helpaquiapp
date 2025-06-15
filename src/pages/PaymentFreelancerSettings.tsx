
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
import { Building, AlertCircle, CheckCircle, ShieldCheck, Loader2, Wallet, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAccessControl } from '@/hooks/useAccessControl';
import { supabase } from '@/integrations/supabase/client';
import { saveBankDetails } from '@/services/paymentService';

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

const PaymentFreelancerSettings = () => {
  const { toast } = useToast();
  const { hasAccess, loading: accessLoading, userId } = useAccessControl({ requiredUserType: 'freelancer' });
  const [activeTab, setActiveTab] = useState("bank-account");
  const [isProcessing, setIsProcessing] = useState(false);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // Bank account form state
  const [bankInfo, setBankInfo] = useState({
    accountName: '',
    bankName: '',
    accountType: 'Corrente',
    accountNumber: '',
    branch: '',
    cpfCnpj: ''
  });

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      if (!userId) return;

      try {
        setLoading(true);

        // Load bank details
        const { data: bankData, error: bankError } = await supabase
          .from('bank_details')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (bankError && bankError.code !== 'PGRST116') {
          console.error('Error loading bank details:', bankError);
        } else if (bankData) {
          setBankDetails(bankData);
          setBankInfo({
            accountName: bankData.bank_name, // Using bank_name as account name for simplicity
            bankName: bankData.bank_name,
            accountType: bankData.account_type,
            accountNumber: bankData.account_number,
            branch: bankData.branch,
            cpfCnpj: bankData.document
          });
        }

        // Load payment history (from payments table where user is freelancer)
        const { data: historyData, error: historyError } = await supabase
          .from('payments')
          .select('id, amount, status, created_at, service_title')
          .eq('freelancer_id', userId)
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

    if (userId) {
      loadData();
    }
  }, [userId]);

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
          .eq('user_id', userId)
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
    }).format(amount / 100); // Amount is stored in cents
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

  if (accessLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-helpaqui-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return null; // Access control will handle redirection
  }
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      
      <main className="flex-1 helpaqui-container py-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Configurações de Pagamento - Freelancer</h1>
          <p className="text-gray-600">
            Configure seus dados bancários para receber pagamentos pelos serviços prestados
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
                      Histórico de Recebimentos
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Recebimento Seguro</CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="h-5 w-5 text-helpaqui-green mt-0.5" />
                  <p className="text-sm text-gray-600">
                    Todos os recebimentos são processados de forma segura e seguem os padrões bancários brasileiros.
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
                    Seus dados bancários estão configurados e você pode receber pagamentos.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsContent value="bank-account">
                <Card>
                  <CardHeader>
                    <CardTitle>Dados Bancários</CardTitle>
                    <CardDescription>
                      Configure sua conta bancária para receber pagamentos pelos serviços prestados
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
                    <CardTitle>Histórico de Recebimentos</CardTitle>
                    <CardDescription>
                      Veja todos os pagamentos que você recebeu
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {paymentHistory.length === 0 ? (
                      <div className="text-center py-8">
                        <Wallet className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-4 text-lg font-medium">Nenhum recebimento ainda</h3>
                        <p className="mt-2 text-gray-500">
                          Seus recebimentos aparecerão aqui quando você começar a prestar serviços.
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
                                Recebido em {formatDate(payment.created_at)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg text-helpaqui-green">
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

export default PaymentFreelancerSettings;
