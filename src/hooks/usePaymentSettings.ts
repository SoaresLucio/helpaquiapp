
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { saveBankDetails } from '@/services/paymentService';

interface PaymentMethod {
  id: string;
  method_type: string;
  card_last_four: string;
  card_brand: string;
  is_default: boolean;
  is_active: boolean;
}

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

interface BankInfo {
  accountName: string;
  bankName: string;
  accountType: string;
  accountNumber: string;
  branch: string;
  cpfCnpj: string;
}

export const usePaymentSettings = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // State for payment methods
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  
  // Bank account info
  const [bankInfo, setBankInfo] = useState<BankInfo>({
    accountName: '',
    bankName: '',
    accountType: 'Corrente',
    accountNumber: '',
    branch: '',
    cpfCnpj: ''
  });

  // Load all data
  const loadData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Load payment methods
      const { data: methodsData, error: methodsError } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('is_default', { ascending: false });

      if (methodsError) {
        console.error('Error loading payment methods:', methodsError);
      } else {
        setPaymentMethods(methodsData || []);
      }

      // Load bank details
      const { data: bankData, error: bankError } = await supabase
        .from('bank_details')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (bankError && bankError.code !== 'PGRST116') {
        console.error('Error loading bank details:', bankError);
      } else if (bankData) {
        setBankDetails(bankData);
        setBankInfo({
          accountName: bankData.bank_name,
          bankName: bankData.bank_name,
          accountType: bankData.account_type,
          accountNumber: bankData.account_number,
          branch: bankData.branch,
          cpfCnpj: bankData.document
        });
      }

      // Load payment history
      const { data: historyData, error: historyError } = await supabase
        .from('payments')
        .select('id, amount, status, created_at, service_title')
        .eq('client_id', user.id)
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

  // Add payment method
  const addPaymentMethod = async (cardData: {
    cardNumber: string;
    cardName: string;
    expiry: string;
    cvv: string;
  }) => {
    if (!user?.id) return false;
    
    setIsProcessing(true);
    
    try {
      const { error } = await supabase
        .from('payment_methods')
        .insert({
          user_id: user.id,
          method_type: 'credit_card',
          card_last_four: cardData.cardNumber.slice(-4),
          card_brand: 'visa',
          is_default: paymentMethods.length === 0
        });

      if (error) throw error;

      // Reload payment methods
      const { data: updatedMethods } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('is_default', { ascending: false });

      setPaymentMethods(updatedMethods || []);
      
      toast({
        title: "Cartão adicionado",
        description: `O cartão terminado em ${cardData.cardNumber.slice(-4)} foi adicionado com sucesso.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error adding card:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o cartão.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Set default payment method
  const setDefaultPaymentMethod = async (id: string) => {
    try {
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', user?.id);

      const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;

      setPaymentMethods(prev => 
        prev.map(method => ({
          ...method,
          is_default: method.id === id
        }))
      );
      
      toast({
        title: "Método padrão atualizado",
        description: "Seu método de pagamento padrão foi atualizado.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o método padrão.",
        variant: "destructive"
      });
    }
  };

  // Remove payment method
  const removePaymentMethod = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      setPaymentMethods(prev => prev.filter(method => method.id !== id));
      
      toast({
        title: "Método removido",
        description: "O método de pagamento foi removido com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o método de pagamento.",
        variant: "destructive"
      });
    }
  };

  // Update bank information
  const updateBankInfo = async (newBankInfo: BankInfo) => {
    setIsProcessing(true);
    
    try {
      const success = await saveBankDetails({
        bankName: newBankInfo.bankName,
        accountType: newBankInfo.accountType,
        accountNumber: newBankInfo.accountNumber,
        branch: newBankInfo.branch,
        document: newBankInfo.cpfCnpj
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
          .eq('user_id', user?.id)
          .maybeSingle();
        
        if (bankData) {
          setBankDetails(bankData);
        }
        return true;
      } else {
        throw new Error('Failed to save bank details');
      }
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar as informações bancárias.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  return {
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
  };
};
