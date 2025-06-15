
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useSecureProfileAccess } from '@/hooks/useSecureProfileAccess';
import { saveSecureBankDetails, getSecureBankDetails } from '@/services/enhancedPaymentService';

interface BankInfo {
  accountName: string;
  bankName: string;
  accountType: string;
  accountNumber: string;
  branch: string;
  cpfCnpj: string;
}

export const useEnhancedPaymentSettings = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { profileData } = useSecureProfileAccess();
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bankDetails, setBankDetails] = useState<any>(null);
  
  const [bankInfo, setBankInfo] = useState<BankInfo>({
    accountName: '',
    bankName: '',
    accountType: 'Corrente',
    accountNumber: '',
    branch: '',
    cpfCnpj: ''
  });

  // Load bank details with enhanced security
  const loadBankDetails = async () => {
    if (!user?.id || !profileData?.hasAccess) return;

    try {
      setLoading(true);
      
      const bankData = await getSecureBankDetails();
      
      if (bankData) {
        setBankDetails(bankData);
        setBankInfo({
          accountName: bankData.bank_name || '',
          bankName: bankData.bank_name || '',
          accountType: bankData.account_type || 'Corrente',
          accountNumber: bankData.account_number || '',
          branch: bankData.branch || '',
          cpfCnpj: bankData.document || ''
        });
      }
    } catch (error) {
      console.error('Error loading bank data:', error);
      toast({
        title: "Erro de Segurança",
        description: "Não foi possível carregar os dados bancários com segurança",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Update bank information with enhanced security
  const updateBankInfo = async (newBankInfo: BankInfo): Promise<boolean> => {
    if (!user?.id || !profileData?.hasAccess) {
      toast({
        title: "Acesso Negado",
        description: "Você não tem permissão para atualizar dados bancários",
        variant: "destructive"
      });
      return false;
    }

    // Check security level
    if (profileData.securityLevel === 'low') {
      toast({
        title: "Segurança Insuficiente",
        description: "Complete e verifique seu perfil antes de adicionar dados bancários",
        variant: "destructive"
      });
      return false;
    }
    
    setIsProcessing(true);
    
    try {
      const success = await saveSecureBankDetails({
        bankName: newBankInfo.bankName,
        accountType: newBankInfo.accountType,
        accountNumber: newBankInfo.accountNumber,
        branch: newBankInfo.branch,
        document: newBankInfo.cpfCnpj
      });

      if (success) {
        toast({
          title: "Dados Bancários Atualizados",
          description: "Suas informações foram salvas com segurança",
        });

        // Reload bank details
        await loadBankDetails();
        return true;
      } else {
        throw new Error('Failed to save bank details');
      }
    } catch (error) {
      toast({
        title: "Erro ao Atualizar",
        description: "Não foi possível atualizar as informações bancárias",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (profileData?.hasAccess) {
      loadBankDetails();
    }
  }, [profileData]);

  return {
    loading,
    isProcessing,
    bankDetails,
    bankInfo,
    setBankInfo,
    updateBankInfo,
    securityLevel: profileData?.securityLevel || 'low',
    hasAccess: profileData?.hasAccess || false
  };
};
