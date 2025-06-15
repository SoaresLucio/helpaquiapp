
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface OfferInterest {
  id: string;
  offer_id: string;
  solicitante_id: string;
  message: string | null;
  status: string;
  created_at: string;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

export const useOfferInterests = (offerId?: string) => {
  const { user } = useAuth();
  const [interests, setInterests] = useState<OfferInterest[]>([]);
  const [loading, setLoading] = useState(false);

  const loadInterests = async () => {
    if (!user || !offerId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('offer_interests')
        .select(`
          *,
          profiles!solicitante_id (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('offer_id', offerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar interesses:', error);
        return;
      }

      setInterests(data || []);
    } catch (error) {
      console.error('Erro inesperado:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateInterestStatus = async (interestId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('offer_interests')
        .update({ status })
        .eq('id', interestId);

      if (error) {
        console.error('Erro ao atualizar status:', error);
        return false;
      }

      // Reload interests after update
      await loadInterests();
      return true;
    } catch (error) {
      console.error('Erro inesperado:', error);
      return false;
    }
  };

  useEffect(() => {
    if (offerId) {
      loadInterests();
    }
  }, [offerId, user]);

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
        () => {
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
    updateInterestStatus,
    reloadInterests: loadInterests
  };
};
