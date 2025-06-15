
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealUser } from '@/types/user';
import { User } from '@supabase/supabase-js';

export const useUserData = (authUser: User | null, userType: 'solicitante' | 'freelancer' | null) => {
  const [currentUser, setCurrentUser] = useState<RealUser | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!authUser?.id) return;
      try {
        const {
          data: profile,
          error
        } = await supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle();
        if (error) {
          console.error('Error fetching user profile:', error);
          return;
        }

        // Create user object with real data
        const realUser: RealUser = {
          id: authUser.id,
          name: profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : authUser.email?.split('@')[0] || 'Usuário',
          email: authUser.email || '',
          phone: profile?.phone || '',
          avatar: profile?.avatar_url || '/placeholder.svg',
          type: userType === 'freelancer' ? 'professional' : 'client',
          isVerified: authUser.email_confirmed_at ? true : false
        };
        setCurrentUser(realUser);
      } catch (error) {
        console.error('Error in fetchUserData:', error);
      }
    };
    fetchUserData();
  }, [authUser, userType]);

  return currentUser;
};
