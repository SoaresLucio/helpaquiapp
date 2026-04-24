
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import BackButton from '@/components/ui/back-button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { usePaymentSettings } from '@/hooks/usePaymentSettings';
import PaymentMethodsTab from '@/components/payment/PaymentMethodsTab';
import BankAccountTab from '@/components/payment/BankAccountTab';
import TransactionHistoryTab from '@/components/payment/TransactionHistoryTab';
import PaymentSidebar from '@/components/payment/PaymentSidebar';
import PaymentSettingsHeader from '@/components/payment/PaymentSettingsHeader';
import PaymentSettingsLoading from '@/components/payment/PaymentSettingsLoading';

const PaymentSettings = () => {
  const [activeTab, setActiveTab] = useState("payment-methods");
  const { loading, isProcessing, paymentMethods, bankDetails, paymentHistory, bankInfo, setBankInfo, addPaymentMethod, setDefaultPaymentMethod, removePaymentMethod, updateBankInfo } = usePaymentSettings();

  if (loading) return <PaymentSettingsLoading />;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <motion.main initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex-1 container mx-auto px-4 py-4">
        <div className="mb-4"><BackButton to="/dashboard" label="Voltar ao Início" /></div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <PaymentSettingsHeader />
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <PaymentSidebar activeTab={activeTab} onTabChange={setActiveTab} bankDetails={bankDetails} />
          <div className="md:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsContent value="payment-methods"><PaymentMethodsTab paymentMethods={paymentMethods} onAddCard={addPaymentMethod} onSetDefault={setDefaultPaymentMethod} onRemove={removePaymentMethod} isProcessing={isProcessing} /></TabsContent>
              <TabsContent value="bank-account"><BankAccountTab bankDetails={bankDetails} bankInfo={bankInfo} setBankInfo={setBankInfo} onUpdateBankInfo={updateBankInfo} isProcessing={isProcessing} /></TabsContent>
              <TabsContent value="transaction-history"><TransactionHistoryTab paymentHistory={paymentHistory} /></TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </motion.main>
    </div>
  );
};

export default PaymentSettings;
