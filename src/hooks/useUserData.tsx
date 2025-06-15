
import { useUserProfile } from './user/useUserProfile';
import { useRealUser } from './user/useRealUser';
import { useSecureAuth } from './useSecureAuth';

export const useUserData = (authUser?: any, userType?: any) => {
  // Use the secure auth hook to get the actual user data
  const { user: actualUser, userType: actualUserType } = useSecureAuth();
  
  // Use the actual authenticated user, not the passed parameters
  const profile = useUserProfile(actualUser);
  const realUser = useRealUser(actualUser, actualUserType, profile);

  return {
    currentUser: realUser,
    profile,
    loading: false
  };
};
