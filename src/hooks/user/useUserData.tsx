import { useUserProfile } from './useUserProfile';
import { useRealUser } from './useRealUser';
import { User } from '@supabase/supabase-js';

export const useUserData = (
  authUser: User | null,
  userType: 'solicitante' | 'freelancer' | 'empresa' | null
) => {
  const profile = useUserProfile(authUser);
  const currentUser = useRealUser(authUser, userType, profile);

  return { currentUser };
};
