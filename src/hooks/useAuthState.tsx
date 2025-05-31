
import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { setupAuthListener, getCurrentSession, getCurrentUser, getUserType } from '@/services/authService';

interface AuthState {
  session: Session | null;
  user: User | null;
  userType: 'solicitante' | 'freelancer' | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export const useAuthState = () => {
  const [authState, setAuthState] = useState<AuthState>({
    session: null,
    user: null,
    userType: null,
    loading: true,
    isAuthenticated: false
  });

  useEffect(() => {
    const handleAuthChange = async (session: Session | null) => {
      console.log('Auth state change:', session);
      
      let userType: 'solicitante' | 'freelancer' | null = null;
      
      if (session?.user) {
        try {
          userType = await getUserType();
          
          if (!userType) {
            userType = session.user.user_metadata?.user_type || localStorage.getItem('userType') as 'solicitante' | 'freelancer';
          }
          
          if (!userType && window.location.pathname !== '/user-type-selection') {
            window.location.href = '/user-type-selection';
            return;
          }
          
          const currentPath = window.location.pathname;
          const isAuthPage = ['/login', '/register', '/user-type-selection'].includes(currentPath);
          
          if (isAuthPage && userType) {
            setTimeout(() => {
              window.location.href = '/';
            }, 100);
          }
          
        } catch (error) {
          console.error("Error getting user type:", error);
          userType = 'solicitante';
        }
      } else {
        localStorage.removeItem('userType');
        
        const currentPath = window.location.pathname;
        const publicPaths = ['/login', '/register', '/reset-password', '/new-password', '/user-type-selection'];
        
        if (!publicPaths.includes(currentPath)) {
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
        }
      }
      
      setAuthState({
        session,
        user: session?.user ?? null,
        userType,
        loading: false,
        isAuthenticated: !!session
      });
    };

    const checkInitialSession = async () => {
      try {
        const currentSession = await getCurrentSession();
        console.log('Current session on load:', currentSession);
        
        if (currentSession) {
          await handleAuthChange(currentSession);
        } else {
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    const subscription = setupAuthListener(handleAuthChange);
    checkInitialSession();

    return () => subscription.unsubscribe();
  }, []);

  return authState;
};
