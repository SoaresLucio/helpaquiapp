
import { supabase } from '@/integrations/supabase/client';

export interface PaymentRequest {
  amount: number;
  serviceId: string;
  freelancerId: string;
  description: string;
}

export interface PaymentResponse {
  success: boolean;
  url?: string;
  error?: string;
  sessionId?: string;
}

// Função que será implementada para criar um pagamento via Stripe
export const createPayment = async (paymentRequest: PaymentRequest): Promise<PaymentResponse> => {
  try {
    // Aqui chamaria a edge function no Supabase que iniciaria o pagamento Stripe
    const { data, error } = await supabase.functions.invoke('create-payment', {
      body: JSON.stringify(paymentRequest)
    });

    if (error) {
      throw error;
    }
    
    return {
      success: true,
      url: data.url,
      sessionId: data.sessionId
    };
  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
    return {
      success: false,
      error: 'Falha ao processar o pagamento. Por favor, tente novamente.'
    };
  }
};

// Prepara a estrutura para verificar o status de um pagamento
export const checkPaymentStatus = async (sessionId: string): Promise<boolean> => {
  try {
    // Aqui chamaria a edge function no Supabase que verificaria o status do pagamento
    const { data, error } = await supabase.functions.invoke('check-payment', {
      body: JSON.stringify({ sessionId })
    });

    if (error) {
      throw error;
    }
    
    return data.paid;
  } catch (error) {
    console.error('Erro ao verificar status do pagamento:', error);
    return false;
  }
};

// Prepara a estrutura para o freelancer cadastrar dados bancários
export interface BankDetails {
  bankName: string;
  accountType: string;
  accountNumber: string;
  branch: string;
  document: string;
}

export const saveBankDetails = async (bankDetails: BankDetails): Promise<boolean> => {
  try {
    // Get current user
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData || !userData.user) {
      throw new Error('Usuário não autenticado');
    }
    
    const userId = userData.user.id;

    // Use a typed approach to avoid TypeScript errors with unknown tables
    // Here we're using the any type as a workaround since the Supabase client
    // doesn't have bank_details in its TypeScript types yet
    const { error } = await (supabase.from('bank_details') as any).upsert({
      user_id: userId,
      bank_name: bankDetails.bankName,
      account_type: bankDetails.accountType,
      account_number: bankDetails.accountNumber,
      branch: bankDetails.branch,
      document: bankDetails.document
    });

    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao salvar dados bancários:', error);
    return false;
  }
};
