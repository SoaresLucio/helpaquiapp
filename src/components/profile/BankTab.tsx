
import React, { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const BankTab: React.FC = () => {
  const { toast } = useToast();
  const [bankName, setBankName] = useState('');
  const [accountType, setAccountType] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [branch, setBranch] = useState('');
  
  const handleBankDetailsSubmit = () => {
    if (!bankName || !accountType || !accountNumber || !branch) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos bancários.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Detalhes bancários salvos",
      description: "Seus dados bancários foram atualizados com sucesso."
    });
  };

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dados Bancários</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="bank-name" className="block text-sm font-medium">Nome do Banco</label>
            <Input
              id="bank-name"
              placeholder="Ex: Banco do Brasil"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="dark:bg-gray-800"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="account-type" className="block text-sm font-medium">Tipo de Conta</label>
            <Input
              id="account-type"
              placeholder="Ex: Corrente, Poupança"
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              className="dark:bg-gray-800"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="account-number" className="block text-sm font-medium">Número da Conta</label>
              <Input
                id="account-number"
                placeholder="Ex: 12345-6"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="dark:bg-gray-800"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="branch" className="block text-sm font-medium">Agência</label>
              <Input
                id="branch"
                placeholder="Ex: 0001"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="dark:bg-gray-800"
              />
            </div>
          </div>
          
          <Button onClick={handleBankDetailsSubmit} className="w-full">
            Salvar Dados Bancários
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Formas de Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-3">Adicione novos métodos de pagamento para suas transações:</p>
          <Button className="flex items-center w-full justify-center">
            <CreditCard className="mr-2 h-4 w-4" />
            Adicionar Novo Cartão
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BankTab;
