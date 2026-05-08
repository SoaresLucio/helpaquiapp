
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useRequestApplications = (requestId: string) => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadApplications = async () => {
    if (!requestId) return;
    
    setLoading(true);
    try {
      // console.log('🔄 Carregando candidaturas para pedido:', requestId);
      
      const { data, error } = await supabase
        .from('service_applications')
        .select('*')
        .eq('service_request_id', requestId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao carregar candidaturas:', error);
        throw error;
      }

      // console.log('✅ Candidaturas carregadas:', data);
      setApplications(data || []);
      
    } catch (error) {
      console.error('💥 Erro inesperado ao carregar candidaturas:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [requestId]);

  // Real-time updates
  useEffect(() => {
    if (!requestId) return;

    // console.log('🔴 Configurando listeners de realtime para candidaturas...');
    
    const channel = supabase
      .channel(`request-applications-${requestId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_applications',
          filter: `service_request_id=eq.${requestId}`
        },
        (payload) => {
          // console.log('🔄 Mudança em candidatura detectada:', payload);
          loadApplications();
        }
      )
      .subscribe((status) => {
        // console.log('📡 Status da conexão realtime:', status);
      });

    return () => {
      // console.log('🔌 Removendo channel realtime...');
      supabase.removeChannel(channel);
    };
  }, [requestId]);

  return {
    applications,
    loading,
    reloadApplications: loadApplications
  };
};
