
import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { setupAuthListener, getCurrentSession, getUserType } from '@/services/authService';

export const useAuthSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<'solicitante' | 'freelancer' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthChange = async (session: Session | null) => {
      console.log('Auth state change:', session);
      
      let fetchedUserType: 'solicitante' | 'freelancer' | null = null;
      
      if (session?.user) {
        try {
          fetchedUserType = await getUserType();
          
          if (!fetchedUserType) {
            fetchedUserType = session.user.user_metadata?.user_type || localStorage.getItem('userType') as 'solicitante' | 'freelancer';
          }
          
          if (fetchedUserType) {
            localStorage.setItem('userType', fetchedUserType);
          }
          
        } catch (error) {
          console.error("Error getting user type:", error);
          fetchedUserType = 'solicitante'; // Default fallback
        }
      } else {
        localStorage.removeItem('userType');
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setUserType(fetchedUserType);
      setLoading(false);
    };

    const checkInitialSession = async () => {
      try {
        const currentSession = await getCurrentSession();
        console.log('Current session on load:', currentSession);
        
        if (currentSession) {
          await handleAuthChange(currentSession);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setLoading(false);
      }
    };

    const subscription = setupAuthListener(handleAuthChange);
    checkInitialSession();

    return () => subscription.unsubscribe();
  }, []);

  return {
    session,
    user,
    userType,
    loading,
    isAuthenticated: !!session
  };
};
