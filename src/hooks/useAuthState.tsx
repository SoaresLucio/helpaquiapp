
import { useAuthSession } from './auth/useAuthSession';

export const useAuthState = () => {
  return useAuthSession();
};
