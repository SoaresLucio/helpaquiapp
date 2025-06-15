
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOffersState } from './useOffersState';
import { useOffersCache } from './useOffersCache';
import { convertSupabaseToMockData } from '@/utils/offerConverterOptimized';
import { Professional } from '@/data/mockData';

export const useOffersDataOptimized = () => {
  const { offers, loading, error, updateOffers, setLoadingState, setErrorState } = useOffersState();
  const { getCachedOffers, setCachedOffers, isCacheValid } = useOffersCache();

  const loadOffers = useCallback(async () => {
    console.log('🔄 useOffersDataOptimized: Iniciando carregamento de ofertas');
    
    // Verificar cache primeiro
    const cachedOffers = getCachedOffers();
    if (cachedOffers && isCacheValid()) {
      console.log('📚 useOffersDataOptimized: Usando ofertas do cache');
      updateOffers(cachedOffers);
      return;
    }

    setLoadingState(true);
    setErrorState(null);

    try {
      const { data, error: supabaseError } = await supabase
        .from('freelancer_service_offers')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (supabaseError) {
        throw new Error(`Erro do Supabase: ${supabaseError.message}`);
      }

      console.log('✅ useOffersDataOptimized: Dados carregados do Supabase:', data?.length);
      
      const convertedOffers = convertSupabaseToMockData(data || []);
      updateOffers(convertedOffers);
      setCachedOffers(convertedOffers);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao carregar ofertas';
      console.error('❌ useOffersDataOptimized: Erro ao carregar ofertas:', errorMessage);
      setErrorState(errorMessage);
    } finally {
      setLoadingState(false);
    }
  }, [getCachedOffers, isCacheValid, updateOffers, setCachedOffers, setLoadingState, setErrorState]);

  const refreshOffers = useCallback(async () => {
    console.log('🔄 useOffersDataOptimized: Refresh solicitado');
    return loadOffers();
  }, [loadOffers]);

  return {
    offers,
    loading,
    error,
    loadOffers,
    refreshOffers,
  };
};
