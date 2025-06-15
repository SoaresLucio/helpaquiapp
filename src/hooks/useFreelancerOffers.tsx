
import { useState, useEffect, useCallback } from 'react';
import { useFreelancerOffersOptimized } from '@/hooks/useFreelancerOffersOptimized';

// Wrapper de compatibilidade para manter a interface existente
export const useFreelancerOffers = () => {
  const { offers, loading, error, reloadOffers, isInitialized } = useFreelancerOffersOptimized();

  // Para compatibilidade com código existente
  const handleReloadOffers = useCallback(() => {
    console.log('🔄 useFreelancerOffers (compatibilidade): Recarregando ofertas...');
    return reloadOffers();
  }, [reloadOffers]);

  // Log apenas em desenvolvimento
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 useFreelancerOffers: Estado das ofertas atualizado:', {
        count: offers.length,
        loading,
        error,
        isInitialized,
        offers: offers.slice(0, 3).map(o => ({ 
          id: o.id, 
          name: o.name, 
          description: o.description?.substring(0, 50) + '...'
        }))
      });
    }
  }, [offers, loading, error, isInitialized]);

  return {
    offers,
    loading,
    error,
    reloadOffers: handleReloadOffers,
  };
};
