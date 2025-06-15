
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Professional } from '@/data/mockData';
import { convertOfferToProfessional } from '@/utils/offerConverter';

export const useOffersData = () => {
  const [offers, setOffers] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFreelancerOffers = useCallback(async () => {
    setLoading(true);
    try {
      console.log('🔄 Carregando ofertas de freelancers...');
      
      const { data, error } = await supabase
        .from('freelancer_service_offers')
        .select(`
          *,
          profiles:profiles!inner(
            first_name,
            last_name,
            avatar_url,
            verified
          ),
          freelancer_ratings!left(
            avg_rating,
            rating_count
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao carregar ofertas com detalhes:', error);
        // Vamos tentar uma query mais simples se a complexa falhar
        const { data: simpleData, error: simpleError } = await supabase
          .from('freelancer_service_offers')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (simpleError) {
          console.error('❌ Erro também na query simples:', simpleError);
          setOffers([]);
          return;
        }

        console.log('✅ Ofertas carregadas com query simples:', simpleData);
        const convertedOffers = simpleData?.map(offer => convertOfferToProfessional({
          ...offer,
          profiles: null,
          freelancer_ratings: null
        })) || [];
        setOffers(convertedOffers);
        return;
      }

      console.log('✅ Ofertas carregadas do Supabase com detalhes:', data);

      const convertedOffers = data?.map(convertOfferToProfessional) || [];

      console.log('✅ Ofertas convertidas finais:', convertedOffers);
      setOffers(convertedOffers);
      
    } catch (error) {
      console.error('💥 Erro inesperado ao carregar ofertas:', error);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    offers,
    loading,
    loadOffers: loadFreelancerOffers,
  };
};
