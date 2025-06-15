
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface BankInfo {
  accountName: string;
  bankName: string;
  accountType: string;
  accountNumber: string;
  branch: string;
  cpfCnpj: string;
}

interface BankDetailsFormProps {
  bankInfo: BankInfo;
  setBankInfo: (info: BankInfo) => void;
  onSubmit: () => Promise<boolean>;
  isProcessing: boolean;
  hasExistingDetails: boolean;
}

const BankDetailsForm: React.FC<BankDetailsFormProps> = ({
  bankInfo,
  setBankInfo,
  onSubmit,
  isProcessing,
  hasExistingDetails
}) => {
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados Bancários</CardTitle>
        <CardDescription>
          Configure sua conta bancária para receber pagamentos pelos serviços prestados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
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
                    {hasExistingDetails ? 'Atualizar dados bancários' : 'Salvar dados bancários'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BankDetailsForm;
