
import { createContext, useContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useLocation } from 'react-router-dom';
import { signOut } from '@/services/authService';
import { useToast } from '@/components/ui/use-toast';
import { useAuthState } from './useAuthState';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  userType: 'solicitante' | 'freelancer' | null;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  isAuthenticated: false,
  userType: null,
  logout: async () => {}
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const authState = useAuthState();

  const logout = async () => {
    try {
      await signOut();
      localStorage.removeItem('userType');
      
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado do sistema."
      });
      
      window.location.href = '/login';
    } catch (error: any) {
      toast({
        title: "Erro ao fazer logout",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <AuthContext.Provider value={{ ...authState, logout }}>
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-helpaqui-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const safePaths = ['/reset-password', '/new-password', '/user-type-selection'];
    
    if (!safePaths.includes(location.pathname)) {
      window.location.href = '/login';
      return null;
    }
  }

  return isAuthenticated ? <>{children}</> : null;
};
