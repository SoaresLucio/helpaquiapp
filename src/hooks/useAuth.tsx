
import { createContext, useContext, ReactNode, useEffect, useState, useMemo } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useAuthSession } from './auth/useAuthSession';
import { supabase } from '@/integrations/supabase/client';
import { validateUserSession, validateUserType } from '@/utils/securityValidation';
import { useUserLocation } from './useUserLocation';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  userType: 'solicitante' | 'freelancer' | 'empresa' | null;
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
  const [profile, setProfile] = useState<any>(null);

  // Centralized location tracking — runs once per auth session, not per route
  useUserLocation();

  useEffect(() => {
    if (!authState.user || !authState.isAuthenticated) {
      setProfile(null);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authState.user!.id)
          .maybeSingle();
        if (cancelled) return;
        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }
        setProfile(data);
      } catch (e) {
        if (!cancelled) console.error('Profile fetch error:', e);
      }
    })();
    return () => { cancelled = true; };
  }, [authState.user?.id, authState.isAuthenticated]);

  const securityScore = useMemo(() => {
    if (!authState.user || !authState.isAuthenticated) return 0;
    let score = 0;
    if (validateUserSession(authState.user).isValid) score += 25;
    if (validateUserType(authState.userType).isValid) score += 25;
    if ((profile as any)?.verified) score += 30;
    if (authState.user.email_confirmed_at) score += 20;
    return score;
  }, [authState.user, authState.isAuthenticated, authState.userType, profile]);

  const isSecure = securityScore >= 70;

  const cleanupLocalAuthState = () => {
    try {
      localStorage.removeItem('userType');
      // Clear any stale Supabase auth keys to prevent ghost sessions
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
    } catch {
      // ignore storage access errors
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      cleanupLocalAuthState();
      setProfile(null);
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado do sistema."
      });
    } catch (error: any) {
      cleanupLocalAuthState();
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
