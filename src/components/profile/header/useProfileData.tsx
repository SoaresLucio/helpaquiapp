
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { getBankDetails } from '@/services/paymentService';

interface ProfileData {
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  phone?: string;
  address?: string;
}

interface BankData {
  bank_name?: string;
  account_number?: string;
  account_type?: string;
  branch?: string;
  document?: string;
}

export const useProfileData = () => {
  const { user: authUser } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [bankData, setBankData] = useState<BankData>({});

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!authUser?.id) return;

      try {
        // Fetch profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, avatar_url, phone, address')
          .eq('id', authUser.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        } else if (profile) {
          setProfileData(profile);
        }

        // Fetch bank data using the new decrypted function
        const bankDetails = await getBankDetails();
        if (bankDetails) {
          setBankData({
            bank_name: bankDetails.bank_name,
            account_number: bankDetails.account_number,
            account_type: bankDetails.account_type,
            branch: bankDetails.branch,
            document: bankDetails.document
          });
        }

      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchProfileData();
  }, [authUser?.id]);

  return { profileData, bankData };
};
