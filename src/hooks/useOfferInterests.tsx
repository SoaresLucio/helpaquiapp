
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useOfferInterests = (offerId: string) => {
  const [interests, setInterests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadInterests = async () => {
    if (!offerId) return;
    
    setLoading(true);
    try {
      console.log('🔄 Carregando interessados para oferta:', offerId);
      
      const { data, error } = await supabase
        .from('offer_interests')
        .select('*')
        .eq('offer_id', offerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao carregar interessados:', error);
        throw error;
      }

      console.log('✅ Interessados carregados:', data);
      setInterests(data || []);
      
    } catch (error) {
      console.error('💥 Erro inesperado ao carregar interessados:', error);
      setInterests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInterests();
  }, [offerId]);

  // Real-time updates
  useEffect(() => {
    if (!offerId) return;

    console.log('🔴 Configurando listeners de realtime para interessados...');
    
    const channel = supabase
      .channel(`offer-interests-${offerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'offer_interests',
          filter: `offer_id=eq.${offerId}`
        },
        (payload) => {
          console.log('🔄 Mudança em interessado detectada:', payload);
          loadInterests();
        }
      )
      .subscribe((status) => {
        console.log('📡 Status da conexão realtime:', status);
      });

    return () => {
      console.log('🔌 Removendo channel realtime...');
      supabase.removeChannel(channel);
    };
  }, [offerId]);

  return {
    interests,
    loading,
    reloadInterests: loadInterests
  };
};
