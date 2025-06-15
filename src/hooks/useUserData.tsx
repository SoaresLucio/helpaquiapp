
import { useUserProfile } from './user/useUserProfile';
import { useRealUser } from './user/useRealUser';
import { User } from '@supabase/supabase-js';

export const useUserData = (authUser: User | null, userType: 'solicitante' | 'freelancer' | null) => {
  const profile = useUserProfile(authUser);
  const realUser = useRealUser(authUser, userType, profile);

  return {
    currentUser: realUser,
    loading: false // Add loading state if needed by the consuming components
  };
};
