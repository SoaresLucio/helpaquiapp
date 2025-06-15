
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface FreelancerOffer {
  id: string;
  title: string;
  description: string;
  categories: string[];
  custom_categories: string[] | null;
  rate: string;
  location: string | null;
  is_active: boolean;
  created_at: string;
}

export const useMyOffers = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState<FreelancerOffer[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMyOffers = async () => {
    if (!user) return;

    setLoading(true);
    try {
      console.log('🔄 Carregando minhas ofertas...');
      
      const { data, error } = await supabase
        .from('freelancer_service_offers')
        .select('*')
        .eq('freelancer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao carregar ofertas:', error);
        return;
      }

      console.log('✅ Ofertas carregadas:', data);
      setOffers(data || []);
    } catch (error) {
      console.error('💥 Erro inesperado:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyOffers();
  }, [user]);

  // Real-time updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`my-offers-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'freelancer_service_offers',
          filter: `freelancer_id=eq.${user.id}`
        },
        () => {
          loadMyOffers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    offers,
    loading,
    reloadOffers: loadMyOffers
  };
};
