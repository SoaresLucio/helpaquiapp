
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useSecureProfileAccess } from '@/hooks/useSecureProfileAccess';
import { saveSecureBankDetails, getSecureBankDetails } from '@/services/enhancedPaymentService';
import { useSecureDataAccess } from '@/hooks/useSecureDataAccess';
import { validateBankAccount, validateCPF, sanitizeText } from '@/utils/inputValidation';
import { paymentRateLimiter, checkRateLimit } from '@/utils/rateLimiting';

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
  const { secureAccess, secureWrite } = useSecureDataAccess();
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

    const result = await secureAccess(
      () => getSecureBankDetails(),
      'bank_details'
    );

    if (result.success && result.data) {
      setBankDetails(result.data);
      setBankInfo({
        accountName: result.data.bank_name || '',
        bankName: result.data.bank_name || '',
        accountType: result.data.account_type || 'Corrente',
        accountNumber: result.data.account_number || '',
        branch: result.data.branch || '',
        cpfCnpj: result.data.document || ''
      });
    } else if (!result.success) {
      console.error('Failed to load bank details:', result.error);
    }

    setLoading(false);
  };

  // Update bank information with enhanced security and validation
  const updateBankInfo = async (newBankInfo: BankInfo): Promise<boolean> => {
    if (!user?.id || !profileData?.hasAccess) {
      toast({
        title: "Acesso Negado",
        description: "Você não tem permissão para atualizar dados bancários",
        variant: "destructive"
      });
      return false;
    }

    // Check rate limit
    const rateCheck = checkRateLimit(paymentRateLimiter, user.id);
    if (!rateCheck.allowed) {
      toast({
        title: "Muitas Tentativas",
        description: `Aguarde ${Math.ceil((rateCheck.resetTime - Date.now()) / 1000)}s antes de tentar novamente`,
        variant: "destructive"
      });
      return false;
    }

    // Validate input data
    const accountValidation = validateBankAccount(newBankInfo.accountNumber);
    if (!accountValidation.isValid) {
      toast({
        title: "Dados Inválidos",
        description: accountValidation.errors.join(', '),
        variant: "destructive"
      });
      return false;
    }

    const cpfValidation = validateCPF(newBankInfo.cpfCnpj);
    if (!cpfValidation.isValid) {
      toast({
        title: "CPF Inválido",
        description: cpfValidation.errors.join(', '),
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
    
    // Sanitize input data
    const sanitizedBankInfo = {
      bankName: sanitizeText(newBankInfo.bankName, 100),
      accountType: sanitizeText(newBankInfo.accountType, 50),
      accountNumber: accountValidation.sanitizedValue!,
      branch: sanitizeText(newBankInfo.branch, 20),
      document: cpfValidation.sanitizedValue!
    };

    const result = await secureWrite(
      () => saveSecureBankDetails(sanitizedBankInfo),
      'bank_details',
      undefined,
      { 
        account_last_four: sanitizedBankInfo.accountNumber.slice(-4),
        bank_name: sanitizedBankInfo.bankName 
      }
    );

    if (result.success) {
      toast({
        title: "Dados Bancários Atualizados",
        description: "Suas informações foram salvas com segurança",
      });

      // Reload bank details
      await loadBankDetails();
      setIsProcessing(false);
      return true;
    } else {
      setIsProcessing(false);
      return false;
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
