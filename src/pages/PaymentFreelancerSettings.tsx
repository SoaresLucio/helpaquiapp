
import React, { useState } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Building, AlertCircle, CheckCircle, ShieldCheck, Loader2, Wallet, PlusCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAccessControl } from '@/hooks/useAccessControl';

const PaymentFreelancerSettings = () => {
  const { toast } = useToast();
  const { hasAccess, loading } = useAccessControl({ requiredUserType: 'freelancer' });
  const [activeTab, setActiveTab] = useState("bank-account");
  const [isProcessing, setIsProcessing] = useState(false);

  // Bank account info for freelancers
  const [bankInfo, setBankInfo] = useState({
    accountName: 'José Silva',
    bankName: 'Banco do Brasil',
    accountType: 'Corrente',
    accountNumber: '12345-6',
    branch: '0001',
    cpfCnpj: '123.456.789-00'
  });

  // Function to update bank information
  const handleUpdateBankInfo = (event: React.FormEvent) => {
    event.preventDefault();
    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Dados bancários atualizados",
        description: "Suas informações de pagamento foram atualizadas com sucesso.",
      });
      
      setIsProcessing(false);
    }, 1000);
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
                      value="earnings"
                      className="w-full justify-start px-4 py-3 border-l-2 border-transparent data-[state=active]:border-helpaqui-blue rounded-none"
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      Ganhos e Saques
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
                              <>Salvar dados bancários</>
                            )}
                          </Button>
                        </div>
                      </div>
                    </form>
                  </CardContent>
                </Card>
                
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Configurações de Recebimento</CardTitle>
                    <CardDescription>
                      Configure como deseja receber seus pagamentos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="auto-transfer">Transferência automática</Label>
                          <Badge variant="outline">Recomendado</Badge>
                        </div>
                        <Switch id="auto-transfer" defaultChecked />
                      </div>
                      <p className="text-sm text-gray-500">
                        Com as transferências automáticas, os pagamentos serão enviados para sua conta bancária assim que estiverem disponíveis.
                      </p>
                      
                      <div className="flex items-center justify-between pt-4">
                        <Label htmlFor="minimum-transfer">Valor mínimo para transferência</Label>
                        <div className="w-24">
                          <Select defaultValue="50">
                            <SelectTrigger id="minimum-transfer">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">R$ 0</SelectItem>
                              <SelectItem value="50">R$ 50</SelectItem>
                              <SelectItem value="100">R$ 100</SelectItem>
                              <SelectItem value="200">R$ 200</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="earnings">
                <Card>
                  <CardHeader>
                    <CardTitle>Ganhos e Saques</CardTitle>
                    <CardDescription>
                      Acompanhe seus ganhos e solicite saques
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-600 font-medium">Disponível para saque</p>
                          <p className="text-2xl font-bold text-green-700">R$ 1.250,00</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-600 font-medium">Ganhos este mês</p>
                          <p className="text-2xl font-bold text-blue-700">R$ 3.420,00</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 font-medium">Total ganho</p>
                          <p className="text-2xl font-bold text-gray-700">R$ 12.580,00</p>
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <Button className="w-full">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Solicitar Saque
                        </Button>
                      </div>
                    </div>
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
                    <div className="text-center py-8">
                      <Wallet className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium">Nenhum recebimento ainda</h3>
                      <p className="mt-2 text-gray-500">
                        Seus recebimentos aparecerão aqui quando você começar a prestar serviços.
                      </p>
                    </div>
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
