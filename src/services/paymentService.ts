import { supabase } from '@/integrations/supabase/client';
import { validateDataAccess, sanitizeUserInput } from '@/utils/securityEnhancement';

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

// Save bank details for freelancer payouts using encrypted function
export const saveBankDetails = async (bankDetails: BankDetails): Promise<boolean> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) {
      throw new Error('User not authenticated');
    }

    const validation = await validateDataAccess(userData.user.id, 'bank_details');
    
    if (!validation.isValid) {
      console.error('Bank details access validation failed:', validation.errors);
      return false;
    }

    const sanitizedDetails = {
      bankName: sanitizeUserInput(bankDetails.bankName),
      accountType: sanitizeUserInput(bankDetails.accountType),
      accountNumber: sanitizeUserInput(bankDetails.accountNumber),
      branch: sanitizeUserInput(bankDetails.branch),
      document: sanitizeUserInput(bankDetails.document)
    };

    const { data, error } = await supabase.rpc('insert_bank_details_encrypted', {
      p_user_id: userData.user.id,
      p_bank_name: sanitizedDetails.bankName,
      p_account_type: sanitizedDetails.accountType,
      p_account_number: sanitizedDetails.accountNumber,
      p_branch: sanitizedDetails.branch,
      p_document: sanitizedDetails.document
    });

    if (error) {
      await supabase.rpc('log_security_event', {
        p_user_id: userData.user.id,
        p_action: 'bank_details_save_failed',
        p_resource_type: 'bank_details',
        p_success: false,
        p_error_message: error.message
      });
      throw error;
    }

    await supabase.rpc('log_security_event', {
      p_user_id: userData.user.id,
      p_action: 'bank_details_saved',
      p_resource_type: 'bank_details',
      p_success: true,
      p_metadata: {
        security_score: validation.securityScore,
        encrypted: true
      }
    });

    return data === true;
  } catch (error) {
    console.error('Bank details save error:', error);
    return false;
  }
};

// Get decrypted bank details
export const getBankDetails = async (): Promise<any> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) {
      throw new Error('User not authenticated');
    }

    const validation = await validateDataAccess(userData.user.id, 'bank_details');
    
    if (!validation.isValid) {
      console.error('Bank details access validation failed:', validation.errors);
      return null;
    }

    const { data, error } = await supabase.rpc('get_bank_details_decrypted', {
      p_user_id: userData.user.id
    });

    if (error) {
      await supabase.rpc('log_security_event', {
        p_user_id: userData.user.id,
        p_action: 'bank_details_access_failed',
        p_resource_type: 'bank_details',
        p_success: false,
        p_error_message: error.message
      });
      throw error;
    }

    await supabase.rpc('log_security_event', {
      p_user_id: userData.user.id,
      p_action: 'bank_details_accessed',
      p_resource_type: 'bank_details',
      p_success: true,
      p_metadata: {
        security_score: validation.securityScore,
        has_data: !!(data && data.length > 0)
      }
    });

    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Bank details retrieval error:', error);
    return null;
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
    
    // Type assertion to ensure status conforms to the expected union type
    return (data || []).map(payment => ({
      ...payment,
      status: payment.status as 'pending' | 'processing' | 'completed' | 'cancelled'
    }));
  } catch (error) {
    console.error('Payment history error:', error);
    return [];
  }
};
