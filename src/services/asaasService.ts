
export interface AsaasPaymentRequest {
  amount: number;
  serviceId: string;
  freelancerId: string;
  description: string;
}

export interface AsaasPaymentResponse {
  success: boolean;
  url?: string;
  error?: string;
  paymentId?: string;
}

export interface AsaasCustomer {
  name: string;
  email: string;
  cpfCnpj?: string;
  phone?: string;
}

export interface AsaasBankDetails {
  bankName: string;
  accountType: string;
  accountNumber: string;
  branch: string;
  document: string;
}

export interface AsaasPaymentFlow {
  id: string;
  client_id: string;
  freelancer_id: string;
  amount: number;
  platform_fee: number;
  freelancer_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  service_id: string;
  service_title: string | null;
  asaas_payment_id: string | null;
  created_at: string;
  updated_at: string;
}

// Platform fee calculation (10%)
export const calculatePlatformFee = (amount: number): { fee: number; freelancerAmount: number } => {
  const fee = Math.round(amount * 0.1);
  const freelancerAmount = amount - fee;
  return { fee, freelancerAmount };
};

// Create payment with Asaas using Supabase Edge Functions
export const createAsaasPayment = async (paymentRequest: AsaasPaymentRequest): Promise<AsaasPaymentResponse> => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { data, error } = await supabase.functions.invoke('process-asaas-payment', {
      body: {
        ...paymentRequest,
        clientId: 'client-placeholder' // Will be updated with actual client ID
      }
    });

    if (error) {
      throw new Error(error.message);
    }
    
    return {
      success: true,
      url: `data:image/png;base64,${data.qrCodeUrl}`,
      paymentId: data.paymentId
    };
  } catch (error) {
    console.error('Asaas payment creation error:', error);
    return {
      success: false,
      error: 'Failed to create payment with Asaas'
    };
  }
};

// Check payment status using Supabase Edge Functions
export const checkAsaasPaymentStatus = async (paymentId: string): Promise<boolean> => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { data, error } = await supabase.functions.invoke('check-asaas-payment', {
      body: { paymentId }
    });

    if (error) {
      console.error('Error checking payment status:', error);
      return false;
    }

    return data?.isPaid || false;
  } catch (error) {
    console.error('Asaas payment status check error:', error);
    return false;
  }
};

// Save bank details for freelancer payouts
export const saveAsaasBankDetails = async (bankDetails: AsaasBankDetails): Promise<boolean> => {
  try {
    const response = await fetch('/api/asaas/save-bank-details', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bankDetails)
    });
    
    return response.ok;
  } catch (error) {
    console.error('Asaas bank details save error:', error);
    return false;
  }
};

// Release funds to freelancer after work completion
export const releaseAsaasFunds = async (paymentId: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/asaas/release-funds', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentId })
    });
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Asaas fund release error:', error);
    return false;
  }
};

// Get payment history
export const getAsaasPaymentHistory = async (): Promise<AsaasPaymentFlow[]> => {
  try {
    const response = await fetch('/api/asaas/payment-history');
    const data = await response.json();
    
    return data.payments || [];
  } catch (error) {
    console.error('Asaas payment history error:', error);
    return [];
  }
};
