
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityEvent {
  id: string;
  action: string;
  resource_type: string;
  success: boolean;
  created_at: string;
  error_message?: string;
  metadata?: any;
}

interface SecurityStats {
  totalEvents: number;
  failedAttempts: number;
  lastActivity: string | null;
  suspiciousActivity: boolean;
}

export const useSecurityMonitor = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [securityStats, setSecurityStats] = useState<SecurityStats>({
    totalEvents: 0,
    failedAttempts: 0,
    lastActivity: null,
    suspiciousActivity: false
  });
  const [loading, setLoading] = useState(true);

  const loadSecurityEvents = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setSecurityEvents(data || []);
      
      // Calcular estatísticas
      const totalEvents = data?.length || 0;
      const failedAttempts = data?.filter(event => !event.success).length || 0;
      const lastActivity = data?.[0]?.created_at || null;
      
      // Detectar atividade suspeita (muitas falhas nos últimos 30 minutos)
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      const recentFailures = data?.filter(event => 
        !event.success && event.created_at > thirtyMinutesAgo
      ).length || 0;
      
      const suspiciousActivity = recentFailures > 5;

      setSecurityStats({
        totalEvents,
        failedAttempts,
        lastActivity,
        suspiciousActivity
      });

      // Alertar sobre atividade suspeita
      if (suspiciousActivity) {
        toast({
          title: "Atividade Suspeita Detectada",
          description: `${recentFailures} tentativas de acesso falharam nos últimos 30 minutos`,
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Error loading security events:', error);
    } finally {
      setLoading(false);
    }
  };

  const logSecurityEvent = async (
    action: string,
    resourceType: string,
    success: boolean = true,
    errorMessage?: string,
    metadata?: any
  ) => {
    if (!user?.id) return;

    try {
      await supabase.rpc('log_security_event_enhanced', {
        p_user_id: user.id,
        p_action: action,
        p_resource_type: resourceType,
        p_success: success,
        p_error_message: errorMessage,
        p_metadata: metadata
      });

      // Recarregar eventos após log
      await loadSecurityEvents();
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  };

  const clearSecurityEvents = async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('security_audit_log')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setSecurityEvents([]);
      setSecurityStats({
        totalEvents: 0,
        failedAttempts: 0,
        lastActivity: null,
        suspiciousActivity: false
      });

      toast({
        title: "Histórico Limpo",
        description: "Eventos de segurança foram removidos"
      });
    } catch (error) {
      console.error('Error clearing security events:', error);
      toast({
        title: "Erro",
        description: "Não foi possível limpar o histórico",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadSecurityEvents();
    }
  }, [user?.id]);

  return {
    securityEvents,
    securityStats,
    loading,
    logSecurityEvent,
    clearSecurityEvents,
    refreshEvents: loadSecurityEvents
  };
};
