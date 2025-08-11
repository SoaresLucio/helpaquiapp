
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityAuditResult {
  isSecure: boolean;
  warnings: string[];
  recommendations: string[];
  score: number;
}

export const useSecurityAudit = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [auditResult, setAuditResult] = useState<SecurityAuditResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runSecurityAudit = async () => {
    if (!isAuthenticated || !user) return;

    setLoading(true);
    const warnings: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    try {
      // Check if user has a complete profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile) {
        warnings.push('Perfil incompleto detectado');
        recommendations.push('Complete seu perfil para melhor segurança');
        score -= 20;
      }

      // Check for verified status
      if (profile && !profile.verified) {
        warnings.push('Conta não verificada');
        recommendations.push('Verifique sua conta para acesso completo');
        score -= 15;
      }

      // Check authentication method strength
      if (!user.email_confirmed_at) {
        warnings.push('Email não confirmado');
        recommendations.push('Confirme seu email para melhor segurança');
        score -= 25;
      }

      // Log security audit com função aprimorada
      await supabase.rpc('log_security_event_enhanced', {
        p_user_id: user.id,
        p_action: 'security_audit',
        p_resource_type: 'user_profile',
        p_success: true,
        p_metadata: {
          score,
          warnings_count: warnings.length,
          timestamp: new Date().toISOString()
        }
      });

      const result: SecurityAuditResult = {
        isSecure: score >= 70,
        warnings,
        recommendations,
        score
      };

      setAuditResult(result);

      if (score < 70) {
        toast({
          title: "Auditoria de Segurança",
          description: `Pontuação: ${score}/100. Verifique as recomendações.`,
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Security audit error:', error);
      toast({
        title: "Erro na Auditoria",
        description: "Não foi possível executar a auditoria de segurança",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      runSecurityAudit();
    }
  }, [isAuthenticated, user]);

  return {
    auditResult,
    loading,
    runSecurityAudit
  };
};
