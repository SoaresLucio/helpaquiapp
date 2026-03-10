
import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';
import { useAuthSession } from './auth/useAuthSession';
import { supabase } from '@/integrations/supabase/client';
import { validateUserSession, validateUserType } from '@/utils/securityValidation';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  userType: 'solicitante' | 'freelancer' | null;
  profile: any;
  logout: () => Promise<void>;
  securityScore: number;
  isSecure: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  isAuthenticated: false,
  userType: null,
  profile: null,
  logout: async () => {},
  securityScore: 0,
  isSecure: false
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const authState = useAuthSession();
  const [profile, setProfile] = useState(null);
  const [securityScore, setSecurityScore] = useState(0);
  const [isSecure, setIsSecure] = useState(false);

  useEffect(() => {
    if (!authState.user || !authState.isAuthenticated) {
      setProfile(null);
      setSecurityScore(0);
      setIsSecure(false);
      return;
    }

    let cancelled = false;

    const fetchProfile = async () => {
      try {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authState.user!.id)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }

        setProfile(profileData);

        // Calculate security score
        let score = 0;
        const userValidation = validateUserSession(authState.user!);
        const userTypeValidation = validateUserType(authState.userType);
        
        if (userValidation.isValid) score += 25;
        if (userTypeValidation.isValid) score += 25;
        if (profileData?.verified) score += 30;
        if (authState.user!.email_confirmed_at) score += 20;
        
        setSecurityScore(score);
        setIsSecure(score >= 70);
      } catch (error) {
        if (!cancelled) console.error('Profile fetch error:', error);
      }
    };

    fetchProfile();
    return () => { cancelled = true; };
  }, [authState.user?.id, authState.isAuthenticated, authState.userType]);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('userType');
      setProfile(null);
      setSecurityScore(0);
      setIsSecure(false);
      
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado do sistema."
      });
    } catch (error: any) {
      // Force local cleanup even if signOut fails
      localStorage.removeItem('userType');
      setProfile(null);
      toast({
        title: "Erro ao fazer logout",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      ...authState, 
      logout, 
      profile, 
      securityScore, 
      isSecure 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const safePaths = ['/reset-password', '/new-password', '/user-type'];
    if (!safePaths.includes(location.pathname)) {
      return null;
    }
  }

  return isAuthenticated ? <>{children}</> : null;
};
