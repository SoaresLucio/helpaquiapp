
import { User } from '@supabase/supabase-js';
import { useUserProfile } from './useUserProfile';
import { useRealUser } from './useRealUser';

export const useUserData = (authUser: User | null, userType: 'solicitante' | 'freelancer' | null) => {
  const profile = useUserProfile(authUser);
  const currentUser = useRealUser(authUser, userType, profile);

  return {
    currentUser,
    profile,
    loading: !profile && !!authUser,
    isValid: !!(currentUser?.id && currentUser?.email)
  };
};
