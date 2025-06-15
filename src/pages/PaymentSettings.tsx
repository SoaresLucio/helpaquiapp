
import React, { useState } from 'react';
import Header from '@/components/Header';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { usePaymentSettings } from '@/hooks/usePaymentSettings';
import PaymentMethodsTab from '@/components/payment/PaymentMethodsTab';
import BankAccountTab from '@/components/payment/BankAccountTab';
import TransactionHistoryTab from '@/components/payment/TransactionHistoryTab';
import PaymentSidebar from '@/components/payment/PaymentSidebar';

const PaymentSettings = () => {
  const [activeTab, setActiveTab] = useState("payment-methods");
  
  const {
    loading,
    isProcessing,
    paymentMethods,
    bankDetails,
    paymentHistory,
    bankInfo,
    setBankInfo,
    addPaymentMethod,
    setDefaultPaymentMethod,
    removePaymentMethod,
    updateBankInfo
  } = usePaymentSettings();

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
          <PaymentSidebar 
            activeTab={activeTab}
            onTabChange={setActiveTab}
            bankDetails={bankDetails}
          />
          
          {/* Main Content */}
          <div className="md:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsContent value="payment-methods">
                <PaymentMethodsTab
                  paymentMethods={paymentMethods}
                  onAddCard={addPaymentMethod}
                  onSetDefault={setDefaultPaymentMethod}
                  onRemove={removePaymentMethod}
                  isProcessing={isProcessing}
                />
              </TabsContent>
              
              <TabsContent value="bank-account">
                <BankAccountTab
                  bankDetails={bankDetails}
                  bankInfo={bankInfo}
                  setBankInfo={setBankInfo}
                  onUpdateBankInfo={updateBankInfo}
                  isProcessing={isProcessing}
                />
              </TabsContent>
              
              <TabsContent value="transaction-history">
                <TransactionHistoryTab paymentHistory={paymentHistory} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentSettings;
