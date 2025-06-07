
import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { setupAuthListener, getCurrentSession, getUserType } from '@/services/authService';

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
      console.log('Auth state change detected:', session?.user?.id);
      
      let userType: 'solicitante' | 'freelancer' | null = null;
      
      if (session?.user) {
        try {
          userType = await getUserType();
          
          if (!userType) {
            userType = session.user.user_metadata?.user_type || localStorage.getItem('userType') as 'solicitante' | 'freelancer';
          }
          
          if (userType) {
            localStorage.setItem('userType', userType);
          }
          
        } catch (error) {
          console.error("Error during auth validation:", error);
          userType = 'solicitante'; // Default fallback
        }
      } else {
        localStorage.removeItem('userType');
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
        console.log('Checking initial session...');
        const currentSession = await getCurrentSession();
        
        if (currentSession) {
          await handleAuthChange(currentSession);
        } else {
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error("Error checking initial session:", error);
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    const subscription = setupAuthListener(handleAuthChange);
    checkInitialSession();

    return () => subscription.unsubscribe();
  }, []);

  return authState;
};
