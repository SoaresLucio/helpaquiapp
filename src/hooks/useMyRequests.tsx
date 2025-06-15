
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

export const useMyRequests = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRequests = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log('🔄 Carregando pedidos do usuário:', user.id);
      
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao carregar pedidos:', error);
        throw error;
      }

      console.log('✅ Pedidos carregados:', data);
      setRequests(data || []);
      
    } catch (error) {
      console.error('💥 Erro inesperado ao carregar pedidos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar seus pedidos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteRequest = async (requestId: string) => {
    try {
      console.log('🗑️ Excluindo pedido:', requestId);
      
      const { error } = await supabase
        .from('service_requests')
        .delete()
        .eq('id', requestId);

      if (error) {
        console.error('❌ Erro ao excluir pedido:', error);
        throw error;
      }

      // Remove from local state
      setRequests(prev => prev.filter(request => request.id !== requestId));
      
      toast({
        title: "Sucesso",
        description: "Pedido excluído com sucesso.",
      });
      
    } catch (error) {
      console.error('💥 Erro ao excluir pedido:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir pedido.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadRequests();
  }, [user]);

  // Real-time updates
  useEffect(() => {
    if (!user) return;

    console.log('🔴 Configurando listeners de realtime para pedidos...');
    
    const channel = supabase
      .channel('my-requests-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_requests',
          filter: `client_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 Mudança em realtime detectada:', payload);
          loadRequests();
        }
      )
      .subscribe((status) => {
        console.log('📡 Status da conexão realtime:', status);
      });

    return () => {
      console.log('🔌 Removendo channel realtime...');
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    requests,
    loading,
    deleteRequest,
    reloadRequests: loadRequests
  };
};
