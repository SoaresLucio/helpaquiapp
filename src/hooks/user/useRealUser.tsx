
import { useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { RealUser } from '@/types/user';

export const useRealUser = (
  authUser: User | null, 
  userType: 'solicitante' | 'freelancer' | 'empresa' | null, 
  profile: any
) => {
  return useMemo(() => {
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
};
