
import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useLocation, useNavigate } from 'react-router-dom';
import { signOut } from '@/services/authService';
import { useToast } from '@/components/ui/use-toast';
import { useAuthSession } from './auth/useAuthSession';
import { validateUserSession, validateUserType } from '@/utils/securityValidation';

interface SecureAuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  userType: 'solicitante' | 'freelancer' | null;
  logout: () => Promise<void>;
  isUserValid: boolean;
  securityErrors: string[];
}

const SecureAuthContext = createContext<SecureAuthContextType>({
  session: null,
  user: null,
  loading: true,
  isAuthenticated: false,
  userType: null,
  logout: async () => {},
  isUserValid: false,
  securityErrors: []
});

export const SecureAuthProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const authState = useAuthSession();
  const [securityErrors, setSecurityErrors] = useState<string[]>([]);
  const [isUserValid, setIsUserValid] = useState(false);

  // Enhanced security validation
  useEffect(() => {
    const errors: string[] = [];

    if (authState.user) {
      const userValidation = validateUserSession(authState.user);
      if (!userValidation.isValid) {
        errors.push(userValidation.error || 'Invalid user session');
        console.error('User validation failed:', userValidation);
      }

      const userTypeValidation = validateUserType(authState.userType);
      if (!userTypeValidation.isValid) {
        errors.push(userTypeValidation.error || 'Invalid user type');
        console.error('User type validation failed:', userTypeValidation);
      }

      setIsUserValid(userValidation.isValid && userTypeValidation.isValid);
    } else {
      setIsUserValid(false);
    }

    setSecurityErrors(errors);

    // Auto-logout on critical security issues
    if (errors.length > 0 && authState.isAuthenticated) {
      console.warn('Security issues detected, forcing logout:', errors);
      logout();
    }
  }, [authState.user, authState.userType, authState.isAuthenticated]);

  const logout = async () => {
    try {
      await signOut();
      localStorage.removeItem('userType');
      setSecurityErrors([]);
      setIsUserValid(false);
      
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado do sistema."
      });
      
      navigate('/login');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "Erro ao fazer logout",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <SecureAuthContext.Provider value={{ 
      ...authState, 
      logout, 
      isUserValid,
      securityErrors 
    }}>
      {children}
    </SecureAuthContext.Provider>
  );
};

export const useSecureAuth = () => useContext(SecureAuthContext);
