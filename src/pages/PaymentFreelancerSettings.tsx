
import React, { useState } from 'react';
import { motion } from 'framer-motion';
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

  const { bankDetails, bankInfo, setBankInfo, loading: bankLoading, isProcessing, updateBankInfo } = useFreelancerBankDetails(userId);
  const { paymentHistory, loading: historyLoading, formatCurrency, formatDate } = useFreelancerPaymentHistory(userId);

  if (accessLoading || bankLoading || historyLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Carregando...</p>
        </motion.div>
      </div>
    );
  }

  if (!hasAccess) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 container mx-auto px-4 py-4"
      >
        <div className="mb-4">
          <BackButton to="/dashboard" label="Voltar ao Início" />
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mb-6">
          <h1 className="text-2xl font-bold mb-2 text-foreground">Configurações de Pagamento</h1>
          <p className="text-muted-foreground">
            Configure seus dados bancários para receber pagamentos pelos serviços prestados
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <FreelancerPaymentSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            hasVerifiedBankDetails={!!bankDetails}
          />
          <div className="md:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsContent value="bank-account">
                <BankDetailsForm bankInfo={bankInfo} setBankInfo={setBankInfo} onSubmit={updateBankInfo} isProcessing={isProcessing} hasExistingDetails={!!bankDetails} />
              </TabsContent>
              <TabsContent value="transaction-history">
                <PaymentHistoryList paymentHistory={paymentHistory} formatCurrency={formatCurrency} formatDate={formatDate} />
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </motion.main>
    </div>
  );
};

export default PaymentFreelancerSettings;
