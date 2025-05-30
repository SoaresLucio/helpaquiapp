
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate, useLocation } from 'react-router-dom';
import { setupAuthListener, getCurrentSession, getCurrentUser, signOut, getUserType } from '@/services/authService';
import { useToast } from '@/components/ui/use-toast';

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
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<'solicitante' | 'freelancer' | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Setup auth listener
    const subscription = setupAuthListener(async (session) => {
      console.log('Auth state change:', session);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        try {
          let type = await getUserType();
          console.log('User type from metadata:', type);
          
          // Get user type from metadata or localStorage
          if (!type) {
            type = session.user.user_metadata?.user_type || localStorage.getItem('userType') as 'solicitante' | 'freelancer';
          }
          
          // If still no type, redirect to selection
          if (!type) {
            console.log('No user type found, redirecting to selection');
            if (window.location.pathname !== '/user-type-selection') {
              window.location.href = '/user-type-selection';
              return;
            }
          }
          
          setUserType(type);
          
          // Handle post-login redirect logic
          const currentPath = window.location.pathname;
          const isAuthPage = ['/login', '/register', '/user-type-selection'].includes(currentPath);
          
          if (isAuthPage && type) {
            console.log(`Redirecting ${type} user to appropriate home`);
            // Small delay to ensure state is updated
            setTimeout(() => {
              window.location.href = '/';
            }, 100);
          }
          
        } catch (error) {
          console.error("Error getting user type:", error);
          setUserType('solicitante'); // Default fallback
        }
      } else {
        setUserType(null);
        localStorage.removeItem('userType');
        
        // Only redirect to login if not already on auth pages
        const currentPath = window.location.pathname;
        const publicPaths = ['/login', '/register', '/reset-password', '/new-password', '/user-type-selection'];
        
        if (!publicPaths.includes(currentPath)) {
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
        }
      }
      
      setLoading(false);
    });

    // Check current session
    const checkSession = async () => {
      try {
        const currentSession = await getCurrentSession();
        console.log('Current session on load:', currentSession);
        
        if (currentSession) {
          const currentUser = await getCurrentUser();
          setSession(currentSession);
          setUser(currentUser);
          
          try {
            let type = await getUserType();
            
            if (!type) {
              type = currentSession.user.user_metadata?.user_type || localStorage.getItem('userType') as 'solicitante' | 'freelancer';
            }
            
            if (!type) {
              if (window.location.pathname !== '/user-type-selection') {
                window.location.href = '/user-type-selection';
                return;
              }
            }
            
            console.log('Setting user type on load:', type);
            setUserType(type);
            
          } catch (error) {
            console.error("Error getting user type on load:", error);
            setUserType('solicitante');
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
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
      setUserType(null);
      localStorage.removeItem('userType');
      
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado do sistema."
      });
      
      // Force redirect to login
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
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        isAuthenticated: !!session,
        userType,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading, userType } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Don't redirect if still loading or on safe paths
    const safePaths = ['/reset-password', '/new-password', '/user-type-selection'];
    
    if (!loading && !isAuthenticated && !safePaths.includes(location.pathname)) {
      window.location.href = '/login';
    }
  }, [isAuthenticated, loading, location.pathname]);

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

  return isAuthenticated ? <>{children}</> : null;
};
