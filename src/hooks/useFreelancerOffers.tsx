
import { useState, useEffect } from 'react';
import { useOffersData } from '@/hooks/offers/useOffersData';
import { useOffersRealtime } from '@/hooks/offers/useOffersRealtime';

export const useFreelancerOffers = () => {
  const { offers, loading, loadOffers } = useOffersData();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    console.log('🚀 Hook de ofertas montado, carregando ofertas...');
    loadOffers();
  }, [loadOffers, refreshKey]);

  // Escutar mudanças em tempo real
  useOffersRealtime({ 
    onOffersChange: () => {
      console.log('🔄 Recarregando ofertas devido a mudança em tempo real...');
      loadOffers();
    }
  });

  // Escutar evento customizado para novas ofertas
  useEffect(() => {
    const handleNewOffer = () => {
      console.log('🆕 Nova oferta detectada, recarregando...');
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('newOfferCreated', handleNewOffer);
    return () => window.removeEventListener('newOfferCreated', handleNewOffer);
  }, []);

  return {
    offers,
    loading,
    reloadOffers: () => {
      console.log('🔄 Recarregamento manual das ofertas...');
      setRefreshKey(prev => prev + 1);
    },
  };
};
