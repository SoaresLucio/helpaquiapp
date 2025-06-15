
// Re-export all functions from the split modules for backwards compatibility
export { 
  signIn, 
  signUp, 
  signOut, 
  resetPassword, 
  updatePassword, 
  signInWithGoogle 
} from './auth/authActions';

export { 
  getCurrentSession, 
  getCurrentUser, 
  getUserType, 
  setupAuthListener, 
  validateSession, 
  verifySession 
} from './auth/authUtils';

export type { AuthUser, AuthResponse, AuthState } from './auth/authTypes';
