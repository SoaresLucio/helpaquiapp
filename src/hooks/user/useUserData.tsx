
import { useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { useUserProfile } from './useUserProfile';
import { RealUser } from '@/types/user';

export const useUserData = (authUser: User | null, userType: 'solicitante' | 'freelancer' | null) => {
  const profile = useUserProfile(authUser);

  const currentUser = useMemo(() => {
    if (!authUser?.id) return null;

    const realUser: RealUser = {
      id: authUser.id,
      name: profile?.first_name && profile?.last_name 
        ? `${profile.first_name} ${profile.last_name}` 
        : authUser.email?.split('@')[0] || 'Usuário',
      email: authUser.email || '',
      phone: profile?.phone || '',
      avatar: profile?.avatar_url || '/placeholder.svg',
      type: userType === 'freelancer' ? 'professional' : 'client',
      isVerified: authUser.email_confirmed_at ? true : false
    };

    return realUser;
  }, [authUser, userType, profile]);

  return {
    currentUser,
    profile,
    loading: !profile && !!authUser,
    isValid: !!(currentUser?.id && currentUser?.email)
  };
};
