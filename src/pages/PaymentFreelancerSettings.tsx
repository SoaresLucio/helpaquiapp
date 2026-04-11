
import React, { useState } from 'react';
import Header from '@/components/Header';
import BackButton from '@/components/ui/back-button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useAccessControl } from '@/hooks/useAccessControl';
import { useFreelancerBankDetails } from '@/hooks/useFreelancerBankDetails';
import { useFreelancerPaymentHistory } from '@/hooks/useFreelancerPaymentHistory';
import BankDetailsForm from '@/components/freelancer/BankDetailsForm';
import PaymentHistoryList from '@/components/freelancer/PaymentHistoryList';
import FreelancerPaymentSidebar from '@/components/freelancer/FreelancerPaymentSidebar';

const PaymentFreelancerSettings = () => {
  const { hasAccess, loading: accessLoading, userId } = useAccessControl({ requiredUserType: 'freelancer' });
  const [activeTab, setActiveTab] = useState("bank-account");
  
  const {
    bankDetails,
    bankInfo,
    setBankInfo,
    loading: bankLoading,
    isProcessing,
    updateBankInfo
  } = useFreelancerBankDetails(userId);

  const {
    paymentHistory,
    loading: historyLoading,
    formatCurrency,
    formatDate
  } = useFreelancerPaymentHistory(userId);

  if (accessLoading || bankLoading || historyLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 helpaqui-container py-4">
        <div className="mb-4">
          <BackButton to="/dashboard" label="Voltar ao Início" />
        </div>
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Configurações de Pagamento - Freelancer</h1>
          <p className="text-gray-600">
            Configure seus dados bancários para receber pagamentos pelos serviços prestados
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <FreelancerPaymentSidebar 
            activeTab={activeTab}
            onTabChange={setActiveTab}
            hasVerifiedBankDetails={!!bankDetails}
          />
          
          <div className="md:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsContent value="bank-account">
                <BankDetailsForm
                  bankInfo={bankInfo}
                  setBankInfo={setBankInfo}
                  onSubmit={updateBankInfo}
                  isProcessing={isProcessing}
                  hasExistingDetails={!!bankDetails}
                />
              </TabsContent>
              
              <TabsContent value="transaction-history">
                <PaymentHistoryList
                  paymentHistory={paymentHistory}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentFreelancerSettings;
