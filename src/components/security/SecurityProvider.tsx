import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface SecurityContextType {
  securityLevel: 'low' | 'medium' | 'high';
  hasActiveThreats: boolean;
  lastSecurityScan: Date | null;
  runSecurityScan: () => Promise<void>;
  securityRecommendations: string[];
}

const SecurityContext = createContext<SecurityContextType>({
  securityLevel: 'low',
  hasActiveThreats: false,
  lastSecurityScan: null,
  runSecurityScan: async () => {},
  securityRecommendations: []
});

export const SecurityProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [securityLevel, setSecurityLevel] = useState<'low' | 'medium' | 'high'>('low');
  const [hasActiveThreats, setHasActiveThreats] = useState(false);
  const [lastSecurityScan, setLastSecurityScan] = useState<Date | null>(null);
  const [securityRecommendations, setSecurityRecommendations] = useState<string[]>([]);

  const runSecurityScan = async () => {
    if (!user || !isAuthenticated) return;

    try {
      // Check for suspicious activity
      const { data: securityEvents, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .eq('user_id', user.id)
        .eq('success', false)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Security scan error:', error);
        return;
      }

      const failedAttempts = securityEvents?.length || 0;
      const recommendations: string[] = [];
      let level: 'low' | 'medium' | 'high' = 'low';
      let threats = false;

      // Analyze failed attempts
      if (failedAttempts > 10) {
        threats = true;
        level = 'high';
        recommendations.push('Muitas tentativas de acesso falharam. Considere alterar sua senha.');
      } else if (failedAttempts > 5) {
        level = 'medium';
        recommendations.push('Algumas tentativas de acesso falharam. Monitore sua conta.');
      }

      // Check profile completeness
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile?.verified) {
        recommendations.push('Complete a verificação do seu perfil para maior segurança.');
      }

      if (!user.email_confirmed_at) {
        recommendations.push('Confirme seu email para ativar recursos de segurança.');
        level = Math.max(level === 'low' ? 0 : level === 'medium' ? 1 : 2, 1) === 0 ? 'low' : 
              Math.max(level === 'low' ? 0 : level === 'medium' ? 1 : 2, 1) === 1 ? 'medium' : 'high';
      }

      setSecurityLevel(level);
      setHasActiveThreats(threats);
      setSecurityRecommendations(recommendations);
      setLastSecurityScan(new Date());

      // Log security scan
      await supabase.rpc('log_security_event', {
        p_user_id: user.id,
        p_action: 'security_scan_completed',
        p_resource_type: 'security',
        p_success: true,
        p_metadata: {
          security_level: level,
          failed_attempts: failedAttempts,
          threats_detected: threats,
          recommendations_count: recommendations.length
        }
      });

      if (threats) {
        toast({
          title: "Atividade Suspeita Detectada",
          description: "Recomendamos que altere sua senha imediatamente.",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Security scan failed:', error);
    }
  };

  // Run automatic security scan on mount and every hour
  useEffect(() => {
    if (isAuthenticated && user) {
      runSecurityScan();
      const interval = setInterval(runSecurityScan, 60 * 60 * 1000); // Every hour
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user]);

  return (
    <SecurityContext.Provider value={{
      securityLevel,
      hasActiveThreats,
      lastSecurityScan,
      runSecurityScan,
      securityRecommendations
    }}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};