
import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Professional } from '@/data/mockData';
import { convertOfferToProfessional } from '@/utils/offerConverter';
import { useOffersState } from './useOffersState';
import { useOffersCache } from './useOffersCache';

export const useOffersDataOptimized = () => {
  const { offers, loading, error, updateOffers, setLoadingState, setErrorState } = useOffersState();
  const { getCachedOffers, setCachedOffers, invalidateCache } = useOffersCache();
  const loadingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadOffers = useCallback(async (forceRefresh = false) => {
    // Verifica cache primeiro
    if (!forceRefresh) {
      const cachedOffers = getCachedOffers();
      if (cachedOffers) {
        updateOffers(cachedOffers);
        return;
      }
    }

    // Evita múltiplas chamadas simultâneas
    if (loadingRef.current) {
      console.log('🚫 useOffersDataOptimized: Carregamento já em andamento');
      return;
    }

    // Cancela requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    loadingRef.current = true;
    setLoadingState(true);
    setErrorState(null);
    
    try {
      console.log('🔄 useOffersDataOptimized: Carregando ofertas...');
      
      const { data, error: queryError } = await supabase
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
        .order('created_at', { ascending: false })
        .abortSignal(abortControllerRef.current.signal);

      if (queryError) {
        console.error('❌ Erro na query detalhada:', queryError);
        
        // Fallback para query simples
        const { data: simpleData, error: simpleError } = await supabase
          .from('freelancer_service_offers')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .abortSignal(abortControllerRef.current.signal);

        if (simpleError) {
          throw new Error(`Erro ao carregar ofertas: ${simpleError.message}`);
        }

        const convertedOffers = simpleData?.map(offer => convertOfferToProfessional({
          ...offer,
          profiles: null,
          freelancer_ratings: null
        })) || [];
        
        updateOffers(convertedOffers);
        setCachedOffers(convertedOffers);
        console.log('✅ Ofertas carregadas com query simples:', convertedOffers.length);
        return;
      }

      const convertedOffers = data?.map(convertOfferToProfessional) || [];
      updateOffers(convertedOffers);
      setCachedOffers(convertedOffers);
      console.log('✅ Ofertas carregadas com sucesso:', convertedOffers.length);
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('🚫 Requisição cancelada');
        return;
      }
      
      console.error('💥 Erro ao carregar ofertas:', error);
      setErrorState(error.message || 'Erro desconhecido');
    } finally {
      setLoadingState(false);
      loadingRef.current = false;
      abortControllerRef.current = null;
    }
  }, [getCachedOffers, updateOffers, setCachedOffers, setLoadingState, setErrorState]);

  const refreshOffers = useCallback(() => {
    invalidateCache();
    return loadOffers(true);
  }, [invalidateCache, loadOffers]);

  return {
    offers,
    loading,
    error,
    loadOffers,
    refreshOffers
  };
};
