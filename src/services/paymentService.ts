
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

export interface BankDetails {
  bankName: string;
  accountType: string;
  accountNumber: string;
  branch: string;
  document: string;
}

export interface PaymentFlow {
  id: string;
  client_id: string;
  freelancer_id: string;
  amount: number;
  platform_fee: number;
  freelancer_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  service_id: string;
  service_title: string | null;
  stripe_session_id: string | null;
  created_at: string;
  updated_at: string;
}

// Platform fee calculation (10%)
export const calculatePlatformFee = (amount: number): { fee: number; freelancerAmount: number } => {
  const fee = Math.round(amount * 0.1);
  const freelancerAmount = amount - fee;
  return { fee, freelancerAmount };
};

// Create payment session with Stripe
export const createPayment = async (paymentRequest: PaymentRequest): Promise<PaymentResponse> => {
  try {
    const { fee, freelancerAmount } = calculatePlatformFee(paymentRequest.amount);
    
    const { data, error } = await supabase.functions.invoke('create-payment', {
      body: JSON.stringify({
        ...paymentRequest,
        platformFee: fee,
        freelancerAmount
      })
    });

    if (error) throw error;
    
    return {
      success: true,
      url: data.url,
      sessionId: data.sessionId
    };
  } catch (error) {
    console.error('Payment creation error:', error);
    return {
      success: false,
      error: 'Failed to create payment session'
    };
  }
};

// Check payment status
export const checkPaymentStatus = async (sessionId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('check-payment', {
      body: JSON.stringify({ sessionId })
    });

    if (error) throw error;
    return data.paid;
  } catch (error) {
    console.error('Payment status check error:', error);
    return false;
  }
};

// Save bank details for freelancer payouts
export const saveBankDetails = async (bankDetails: BankDetails): Promise<boolean> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase.rpc('insert_bank_details', {
      p_user_id: userData.user.id,
      p_bank_name: bankDetails.bankName,
      p_account_type: bankDetails.accountType,
      p_account_number: bankDetails.accountNumber,
      p_branch: bankDetails.branch,
      p_document: bankDetails.document
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Bank details save error:', error);
    return false;
  }
};

// Release funds to freelancer after work completion
export const releaseFunds = async (paymentId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('release-funds', {
      body: JSON.stringify({ paymentId })
    });

    if (error) throw error;
    return data.success;
  } catch (error) {
    console.error('Fund release error:', error);
    return false;
  }
};

// Get payment history
export const getPaymentHistory = async (): Promise<PaymentFlow[]> => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Payment history error:', error);
    return [];
  }
};
