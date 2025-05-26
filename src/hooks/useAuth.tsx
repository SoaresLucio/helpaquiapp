
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate, useLocation } from 'react-router-dom';
import { setupAuthListener, getCurrentSession, getCurrentUser, signOut } from '@/services/authService';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  isAuthenticated: false,
  logout: async () => {}
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Configurar listener de autenticação
    const subscription = setupAuthListener((session) => {
      console.log('Auth state change:', session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Verificar sessão atual
    const checkSession = async () => {
      try {
        const currentSession = await getCurrentSession();
        console.log('Current session:', currentSession);
        if (currentSession) {
          const currentUser = await getCurrentUser();
          setSession(currentSession);
          setUser(currentUser);
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      await signOut();
      setSession(null);
      setUser(null);
      toast({
        title: "Desconectado com sucesso",
        description: "Você foi desconectado do sistema."
      });
    } catch (error: any) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        isAuthenticated: !!session,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Não redirecionar se estiver na página de reset de senha ou se ainda estiver carregando
    if (!loading && !isAuthenticated && location.pathname !== '/reset-password') {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate, location.pathname]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  return isAuthenticated ? <>{children}</> : null;
};
