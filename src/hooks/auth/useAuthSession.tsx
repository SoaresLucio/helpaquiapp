
import { useState, useEffect, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuthSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<'solicitante' | 'freelancer' | null>(null);
  const [loading, setLoading] = useState(true);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const resolveUserType = (session: Session | null): 'solicitante' | 'freelancer' | null => {
      if (!session?.user) return null;
      const meta = session.user.user_metadata?.user_type;
      if (meta && ['solicitante', 'freelancer'].includes(meta)) return meta;
      const stored = localStorage.getItem('userType');
      if (stored && ['solicitante', 'freelancer'].includes(stored)) return stored as any;
      return 'solicitante';
    };

    const handleSession = (session: Session | null) => {
      const ut = resolveUserType(session);
      if (ut) localStorage.setItem('userType', ut);
      else localStorage.removeItem('userType');
      setSession(session);
      setUser(session?.user ?? null);
      setUserType(ut);
      setLoading(false);
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
          handleSession(session);
        }
      }
    );

    // Check initial session - use getSession (no network call) to avoid retry loops
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.warn('Session retrieval failed, clearing auth state:', error.message);
        // Clear stale tokens to stop retry loops
        supabase.auth.signOut({ scope: 'local' }).catch(() => {});
        handleSession(null);
      } else {
        handleSession(session);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    session,
    user,
    userType,
    loading,
    isAuthenticated: !!session
  };
};
