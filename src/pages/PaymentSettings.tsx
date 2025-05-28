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

const PaymentSettings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("payment-methods");
  const [isProcessing, setIsProcessing] = useState(false);

  // Payment method states
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: '1',
      type: 'credit-card',
      name: 'Cartão principal',
      last4: '4242',
      brand: 'visa',
      expiry: '12/25',
      isDefault: true
    },
    {
      id: '2',
      type: 'credit-card',
      name: 'Cartão secundário',
      last4: '1234',
      brand: 'mastercard',
      expiry: '09/24',
      isDefault: false
    }
  ]);
  
  // Bank account info (for freelancers)
  const [bankInfo, setBankInfo] = useState({
    accountName: 'José Silva',
    bankName: 'Banco do Brasil',
    accountType: 'Corrente',
    accountNumber: '12345-6',
    branch: '0001',
    cpfCnpj: '123.456.789-00'
  });
  
  // New card state
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
    saveCard: true
  });
  
  // Function to add a new payment method
  const handleAddCard = (event: React.FormEvent, onClose: () => void) => {
    event.preventDefault();
    setIsProcessing(true);
    
    // Simulate API call to process card
    setTimeout(() => {
      const last4 = newCard.cardNumber.slice(-4);
      
      const newPaymentMethod = {
        id: Date.now().toString(),
        type: 'credit-card',
        name: `Cartão ${newCard.cardName}`,
        last4,
        brand: 'visa', // Just for the example
        expiry: newCard.expiry,
        isDefault: false
      };
      
      setPaymentMethods(prev => [...prev, newPaymentMethod]);
      
      setNewCard({
        cardNumber: '',
        cardName: '',
        expiry: '',
        cvv: '',
        saveCard: true
      });
      
      toast({
        title: "Cartão adicionado",
        description: `O cartão terminado em ${last4} foi adicionado com sucesso.`,
      });
      
      setIsProcessing(false);
      onClose();
    }, 1500);
  };
  
  // Function to set a payment method as default
  const setDefaultPaymentMethod = (id: string) => {
    setPaymentMethods(prev => 
      prev.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
    
    toast({
      title: "Método padrão atualizado",
      description: "Seu método de pagamento padrão foi atualizado.",
    });
  };
  
  // Function to remove a payment method
  const removePaymentMethod = (id: string) => {
    setPaymentMethods(prev => prev.filter(method => method.id !== id));
    
    toast({
      title: "Método removido",
      description: "O método de pagamento foi removido com sucesso.",
    });
  };
  
  // Function to update bank information (for freelancers)
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
  
  // Create a component for the add card form
  const AddCardForm = () => {
    return (
      <form onSubmit={(e) => {
        // Create a dummy close function for the dialog
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
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-3">
            {/* Important: Use a single Tabs component that wraps all TabsContent items */}
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
                                {method.brand === 'visa' ? (
                                  <span className="text-blue-700 font-bold">VISA</span>
                                ) : (
                                  <span className="text-red-600 font-bold">MC</span>
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{method.name}</p>
                                <p className="text-sm text-gray-500">
                                  •••• {method.last4} | Expira em {method.expiry}
                                </p>
                              </div>
                              {method.isDefault && (
                                <Badge variant="outline" className="ml-2">Padrão</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {!method.isDefault && (
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
                      Configure sua conta bancária para receber pagamentos como profissional
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
                    <CardTitle>Recebimentos</CardTitle>
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
              
              <TabsContent value="transaction-history">
                <Card>
                  <CardHeader>
                    <CardTitle>Histórico de Transações</CardTitle>
                    <CardDescription>
                      Veja todos os seus pagamentos e recebimentos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Wallet className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium">Nenhuma transação ainda</h3>
                      <p className="mt-2 text-gray-500">
                        Suas transações aparecerão aqui quando você começar a usar a plataforma.
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

export default PaymentSettings;
