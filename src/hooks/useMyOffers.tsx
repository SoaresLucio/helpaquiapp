
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

export const useMyOffers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadOffers = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log('🔄 Carregando ofertas do freelancer:', user.id);
      
      const { data, error } = await supabase
        .from('freelancer_service_offers')
        .select('*')
        .eq('freelancer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao carregar ofertas:', error);
        throw error;
      }

      console.log('✅ Ofertas carregadas:', data);
      setOffers(data || []);
      
    } catch (error) {
      console.error('💥 Erro inesperado ao carregar ofertas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar suas ofertas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteOffer = async (offerId: string) => {
    try {
      console.log('🗑️ Excluindo oferta:', offerId);
      
      const { error } = await supabase
        .from('freelancer_service_offers')
        .delete()
        .eq('id', offerId);

      if (error) {
        console.error('❌ Erro ao excluir oferta:', error);
        throw error;
      }

      // Remove from local state
      setOffers(prev => prev.filter(offer => offer.id !== offerId));
      
      toast({
        title: "Sucesso",
        description: "Oferta excluída com sucesso.",
      });
      
    } catch (error) {
      console.error('💥 Erro ao excluir oferta:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir oferta.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadOffers();
  }, [user]);

  // Real-time updates
  useEffect(() => {
    if (!user) return;

    console.log('🔴 Configurando listeners de realtime para ofertas...');
    
    const channel = supabase
      .channel('my-offers-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'freelancer_service_offers',
          filter: `freelancer_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 Mudança em realtime detectada:', payload);
          loadOffers();
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
    offers,
    loading,
    deleteOffer,
    reloadOffers: loadOffers
  };
};
