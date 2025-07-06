
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useOfferInterests = (offerId: string) => {
  const [interests, setInterests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadInterests = async () => {
    if (!offerId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('offer_interests')
        .select('*')
        .eq('offer_id', offerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar interessados:', error);
        throw error;
      }

      setInterests(data || []);
      
    } catch (error) {
      console.error('Erro inesperado ao carregar interessados:', error);
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
          if (process.env.NODE_ENV === 'development') {
            console.log('Mudança em interessado detectada:', payload);
          }
          loadInterests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [offerId]);

  return {
    interests,
    loading,
    reloadInterests: loadInterests
  };
};
