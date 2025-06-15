
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { saveBankDetails } from '@/services/paymentService';

interface BankDetails {
  id: string;
  bank_name: string;
  account_type: string;
  account_number: string;
  branch: string;
  document: string;
}

interface BankInfo {
  accountName: string;
  bankName: string;
  accountType: string;
  accountNumber: string;
  branch: string;
  cpfCnpj: string;
}

export const useFreelancerBankDetails = (userId: string | null) => {
  const { toast } = useToast();
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [bankInfo, setBankInfo] = useState<BankInfo>({
    accountName: '',
    bankName: '',
    accountType: 'Corrente',
    accountNumber: '',
    branch: '',
    cpfCnpj: ''
  });

  useEffect(() => {
    const loadBankDetails = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const { data: bankData, error: bankError } = await supabase
          .from('bank_details')
          .select('*')
          .eq('user_id', userId)
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
      } catch (error) {
        console.error('Error loading bank data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadBankDetails();
    }
  }, [userId]);

  const updateBankInfo = async () => {
    if (!userId) return false;
    
    setIsProcessing(true);
    
    try {
      const success = await saveBankDetails({
        bankName: bankInfo.bankName,
        accountType: bankInfo.accountType,
        accountNumber: bankInfo.accountNumber,
        branch: bankInfo.branch,
        document: bankInfo.cpfCnpj
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
          .eq('user_id', userId)
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

  return {
    bankDetails,
    bankInfo,
    setBankInfo,
    loading,
    isProcessing,
    updateBankInfo
  };
};
