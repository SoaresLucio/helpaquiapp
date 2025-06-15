
import { supabase } from '@/integrations/supabase/client';
import { validateDataAccess, sanitizeUserInput } from '@/utils/securityEnhancement';

export interface SecureBankDetails {
  bankName: string;
  accountType: string;
  accountNumber: string;
  branch: string;
  document: string;
}

export const saveSecureBankDetails = async (bankDetails: SecureBankDetails): Promise<boolean> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) {
      throw new Error('User not authenticated');
    }

    // Validate access before proceeding
    const validation = await validateDataAccess(userData.user.id, 'bank_details');
    
    if (!validation.isValid) {
      console.error('Bank details access validation failed:', validation.errors);
      return false;
    }

    // Sanitize input data
    const sanitizedDetails = {
      bankName: sanitizeUserInput(bankDetails.bankName),
      accountType: sanitizeUserInput(bankDetails.accountType),
      accountNumber: sanitizeUserInput(bankDetails.accountNumber),
      branch: sanitizeUserInput(bankDetails.branch),
      document: sanitizeUserInput(bankDetails.document)
    };

    // Use the encrypted function with validated and sanitized data
    const { data, error } = await supabase.rpc('insert_bank_details_encrypted', {
      p_user_id: userData.user.id,
      p_bank_name: sanitizedDetails.bankName,
      p_account_type: sanitizedDetails.accountType,
      p_account_number: sanitizedDetails.accountNumber,
      p_branch: sanitizedDetails.branch,
      p_document: sanitizedDetails.document
    });

    if (error) {
      // Log the security event for failed bank details save
      await supabase.rpc('log_security_event', {
        p_user_id: userData.user.id,
        p_action: 'bank_details_save_failed',
        p_resource_type: 'bank_details',
        p_success: false,
        p_error_message: error.message
      });
      throw error;
    }

    // Log successful bank details save
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
    console.error('Secure bank details save error:', error);
    return false;
  }
};

export const getSecureBankDetails = async (): Promise<any> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) {
      throw new Error('User not authenticated');
    }

    // Validate access before proceeding
    const validation = await validateDataAccess(userData.user.id, 'bank_details');
    
    if (!validation.isValid) {
      console.error('Bank details access validation failed:', validation.errors);
      return null;
    }

    // Use the decrypted function
    const { data, error } = await supabase.rpc('get_bank_details_decrypted', {
      p_user_id: userData.user.id
    });

    if (error) {
      // Log the security event for failed bank details retrieval
      await supabase.rpc('log_security_event', {
        p_user_id: userData.user.id,
        p_action: 'bank_details_access_failed',
        p_resource_type: 'bank_details',
        p_success: false,
        p_error_message: error.message
      });
      throw error;
    }

    // Log successful bank details access
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
    console.error('Secure bank details retrieval error:', error);
    return null;
  }
};
