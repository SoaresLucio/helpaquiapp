
import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { setupAuthListener, getCurrentSession, getCurrentUser, getUserType, validateUserData, validateSession } from '@/services/authService';
import { securityService } from '@/services/securityService';

interface AuthState {
  session: Session | null;
  user: User | null;
  userType: 'solicitante' | 'freelancer' | null;
  loading: boolean;
  isAuthenticated: boolean;
  securityValidated: boolean;
}

export const useAuthState = () => {
  const [authState, setAuthState] = useState<AuthState>({
    session: null,
    user: null,
    userType: null,
    loading: true,
    isAuthenticated: false,
    securityValidated: false
  });

  useEffect(() => {
    const handleAuthChange = async (session: Session | null) => {
      console.log('Security: Auth state change detected:', session?.user?.id);
      
      let userType: 'solicitante' | 'freelancer' | null = null;
      let securityValidated = false;
      
      if (session?.user) {
        try {
          // Validação de segurança da sessão
          const isSessionValid = await validateSession();
          if (!isSessionValid) {
            console.warn('Security: Invalid session detected, forcing logout');
            await securityService.logSecurityEvent({
              event_type: 'suspicious_activity',
              user_id: session.user.id,
              metadata: { reason: 'invalid_session_forced_logout' },
              risk_level: 'high'
            });
            
            // Forçar logout em caso de sessão inválida
            setAuthState({
              session: null,
              user: null,
              userType: null,
              loading: false,
              isAuthenticated: false,
              securityValidated: false
            });
            return;
          }

          // Validação adicional dos dados do usuário
          if (!validateUserData(session.user)) {
            console.error('Security: Invalid user data detected');
            await securityService.logSecurityEvent({
              event_type: 'suspicious_activity',
              user_id: session.user.id,
              metadata: { reason: 'invalid_user_data_in_auth_change' },
              risk_level: 'critical'
            });
            
            setAuthState({
              session: null,
              user: null,
              userType: null,
              loading: false,
              isAuthenticated: false,
              securityValidated: false
            });
            return;
          }

          userType = await getUserType();
          
          if (!userType) {
            userType = session.user.user_metadata?.user_type || localStorage.getItem('userType') as 'solicitante' | 'freelancer';
          }
          
          if (userType) {
            localStorage.setItem('userType', userType);
          }
          
          securityValidated = true;
          
          // Log successful authentication validation
          await securityService.logSecurityEvent({
            event_type: 'login_attempt',
            user_id: session.user.id,
            metadata: { 
              action: 'auth_state_validated',
              userType,
              sessionExpiry: session.expires_at
            },
            risk_level: 'low'
          });
          
        } catch (error) {
          console.error("Security: Error during auth validation:", error);
          await securityService.logSecurityEvent({
            event_type: 'suspicious_activity',
            user_id: session.user.id,
            metadata: { reason: 'auth_validation_error', error: String(error) },
            risk_level: 'high'
          });
          
          userType = 'solicitante'; // Default fallback
          securityValidated = false;
        }
      } else {
        localStorage.removeItem('userType');
        
        // Log logout
        await securityService.logSecurityEvent({
          event_type: 'login_attempt',
          metadata: { action: 'user_logged_out' },
          risk_level: 'low'
        });
      }
      
      setAuthState({
        session,
        user: session?.user ?? null,
        userType,
        loading: false,
        isAuthenticated: !!session && securityValidated,
        securityValidated
      });
    };

    const checkInitialSession = async () => {
      try {
        console.log('Security: Checking initial session...');
        const currentSession = await getCurrentSession();
        
        if (currentSession) {
          // Verificação de segurança da sessão inicial
          const isValid = await validateSession();
          if (!isValid) {
            console.warn('Security: Initial session validation failed');
            setAuthState(prev => ({ ...prev, loading: false, securityValidated: false }));
            return;
          }
          
          await handleAuthChange(currentSession);
        } else {
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error("Security: Error checking initial session:", error);
        await securityService.logSecurityEvent({
          event_type: 'suspicious_activity',
          metadata: { reason: 'initial_session_check_error', error: String(error) },
          risk_level: 'medium'
        });
        setAuthState(prev => ({ ...prev, loading: false, securityValidated: false }));
      }
    };

    const subscription = setupAuthListener(handleAuthChange);
    checkInitialSession();

    return () => subscription.unsubscribe();
  }, []);

  // Verificação periódica de segurança da sessão
  useEffect(() => {
    if (authState.isAuthenticated && authState.session) {
      const checkSessionSecurity = async () => {
        try {
          const isValid = await validateSession();
          if (!isValid && authState.isAuthenticated) {
            console.warn('Security: Session security check failed, forcing logout');
            await securityService.logSecurityEvent({
              event_type: 'suspicious_activity',
              user_id: authState.user?.id,
              metadata: { reason: 'periodic_session_validation_failed' },
              risk_level: 'high'
            });
            
            setAuthState(prev => ({
              ...prev,
              session: null,
              user: null,
              userType: null,
              isAuthenticated: false,
              securityValidated: false
            }));
          }
        } catch (error) {
          console.error('Security: Error during periodic session check:', error);
        }
      };

      // Verificar a cada 5 minutos
      const interval = setInterval(checkSessionSecurity, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [authState.isAuthenticated, authState.session, authState.user?.id]);

  return authState;
};
