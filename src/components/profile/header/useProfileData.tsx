
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

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

        // Fetch bank data
        const { data: bank, error: bankError } = await supabase
          .from('bank_details')
          .select('bank_name, account_number, account_type, branch, document')
          .eq('user_id', authUser.id)
          .maybeSingle();

        if (bankError) {
          console.error('Error fetching bank data:', bankError);
        } else if (bank) {
          setBankData(bank);
        }

      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchProfileData();
  }, [authUser?.id]);

  return { profileData, bankData };
};
