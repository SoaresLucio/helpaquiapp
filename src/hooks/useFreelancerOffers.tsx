
import { useState, useEffect, useCallback } from 'react';
import { useOffersData } from '@/hooks/offers/useOffersData';
import { useOffersRealtime } from '@/hooks/offers/useOffersRealtime';

export const useFreelancerOffers = () => {
  const { offers, loading, loadOffers } = useOffersData();
  const [isInitialized, setIsInitialized] = useState(false);

  // Função memoizada para recarregar ofertas
  const handleReloadOffers = useCallback(() => {
    console.log('🔄 useFreelancerOffers: Recarregando ofertas...');
    loadOffers();
  }, [loadOffers]);

  // Carregamento inicial apenas uma vez
  useEffect(() => {
    if (!isInitialized) {
      console.log('🚀 useFreelancerOffers: Carregamento inicial das ofertas...');
      loadOffers();
      setIsInitialized(true);
    }
  }, [isInitialized, loadOffers]);

  // Escutar mudanças em tempo real (sem auto-refresh para evitar loops)
  useOffersRealtime({ 
    onOffersChange: handleReloadOffers
  });

  // Escutar evento customizado para novas ofertas
  useEffect(() => {
    const handleNewOffer = () => {
      console.log('🆕 useFreelancerOffers: Nova oferta detectada via evento customizado');
      handleReloadOffers();
    };

    console.log('👂 useFreelancerOffers: Configurando listener para newOfferCreated');
    window.addEventListener('newOfferCreated', handleNewOffer);
    
    return () => {
      console.log('🧹 useFreelancerOffers: Removendo listener para newOfferCreated');
      window.removeEventListener('newOfferCreated', handleNewOffer);
    };
  }, [handleReloadOffers]);

  // Log quando as ofertas mudarem (apenas para debug)
  useEffect(() => {
    console.log('📊 useFreelancerOffers: Estado das ofertas atualizado:', {
      count: offers.length,
      loading,
      isInitialized,
      offers: offers.slice(0, 3).map(o => ({ 
        id: o.id, 
        name: o.name, 
        description: o.description?.substring(0, 50) + '...'
      }))
    });
  }, [offers, loading, isInitialized]);

  return {
    offers,
    loading,
    reloadOffers: handleReloadOffers,
  };
};
