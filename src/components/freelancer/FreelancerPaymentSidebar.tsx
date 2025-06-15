
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Wallet, ShieldCheck, CheckCircle } from 'lucide-react';

interface FreelancerPaymentSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  hasVerifiedBankDetails: boolean;
}

const FreelancerPaymentSidebar: React.FC<FreelancerPaymentSidebarProps> = ({
  activeTab,
  onTabChange,
  hasVerifiedBankDetails
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0">
          <Tabs
            value={activeTab}
            onValueChange={onTabChange}
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

      {hasVerifiedBankDetails && (
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
  );
};

export default FreelancerPaymentSidebar;
