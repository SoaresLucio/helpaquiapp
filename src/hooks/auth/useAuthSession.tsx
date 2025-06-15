
import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { setupAuthListener, getCurrentSession, getUserType } from '@/services/authService';

export const useAuthSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<'solicitante' | 'freelancer' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 useAuthSession: Starting auth session hook');

    const handleAuthChange = async (session: Session | null) => {
      console.log('🔄 useAuthSession: Auth state change detected:', !!session);
      
      let fetchedUserType: 'solicitante' | 'freelancer' | null = null;
      
      if (session?.user) {
        try {
          console.log('👤 useAuthSession: Fetching user type for user:', session.user.id);
          fetchedUserType = await getUserType();
          
          if (!fetchedUserType) {
            fetchedUserType = session.user.user_metadata?.user_type || localStorage.getItem('userType') as 'solicitante' | 'freelancer';
            console.log('📱 useAuthSession: Using fallback userType:', fetchedUserType);
          }
          
          if (fetchedUserType) {
            localStorage.setItem('userType', fetchedUserType);
            console.log('💾 useAuthSession: Saved userType to localStorage:', fetchedUserType);
          }
          
        } catch (error) {
          console.error("❌ useAuthSession: Error getting user type:", error);
          fetchedUserType = 'solicitante'; // Default fallback
        }
      } else {
        console.log('🚫 useAuthSession: No session, removing userType from localStorage');
        localStorage.removeItem('userType');
      }
      
      console.log('✅ useAuthSession: Setting state:', {
        hasSession: !!session,
        userId: session?.user?.id,
        userType: fetchedUserType
      });

      setSession(session);
      setUser(session?.user ?? null);
      setUserType(fetchedUserType);
      setLoading(false);
    };

    const checkInitialSession = async () => {
      try {
        console.log('🔍 useAuthSession: Checking initial session...');
        const currentSession = await getCurrentSession();
        console.log('📊 useAuthSession: Current session on load:', !!currentSession);
        
        if (currentSession) {
          await handleAuthChange(currentSession);
        } else {
          console.log('🚫 useAuthSession: No initial session found');
          setLoading(false);
        }
      } catch (error) {
        console.error("❌ useAuthSession: Error checking session:", error);
        setLoading(false);
      }
    };

    console.log('👂 useAuthSession: Setting up auth listener...');
    const subscription = setupAuthListener(handleAuthChange);
    checkInitialSession();

    return () => {
      console.log('🧹 useAuthSession: Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  // Log state changes
  useEffect(() => {
    console.log('📊 useAuthSession: State updated:', {
      hasSession: !!session,
      hasUser: !!user,
      userType,
      loading,
      isAuthenticated: !!session
    });
  }, [session, user, userType, loading]);

  return {
    session,
    user,
    userType,
    loading,
    isAuthenticated: !!session
  };
};
