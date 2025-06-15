
import { useState, useEffect, useCallback } from 'react';
import { useOffersDataOptimized } from '@/hooks/offers/useOffersDataOptimized';
import { useOffersRealtimeOptimized } from '@/hooks/offers/useOffersRealtimeOptimized';

export const useFreelancerOffersOptimized = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { offers, loading, error, loadOffers, refreshOffers } = useOffersDataOptimized();

  // Carregamento inicial
  useEffect(() => {
    if (!isInitialized) {
      console.log('🚀 useFreelancerOffersOptimized: Carregamento inicial');
      loadOffers();
      setIsInitialized(true);
    }
  }, [isInitialized, loadOffers]);

  // Realtime com controle de estado
  useOffersRealtimeOptimized({ 
    onOffersChange: refreshOffers,
    enabled: isInitialized
  });

  const reloadOffers = useCallback(() => {
    console.log('🔄 useFreelancerOffersOptimized: Reload manual');
    return refreshOffers();
  }, [refreshOffers]);

  // Log de mudanças (apenas em desenvolvimento)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 useFreelancerOffersOptimized: Estado atualizado:', {
        count: offers.length,
        loading,
        error,
        isInitialized
      });
    }
  }, [offers.length, loading, error, isInitialized]);

  return {
    offers,
    loading,
    error,
    reloadOffers,
    isInitialized
  };
};
