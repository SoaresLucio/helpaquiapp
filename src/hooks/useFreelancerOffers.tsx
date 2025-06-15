
import { useState, useEffect } from 'react';
import { useOffersData } from '@/hooks/offers/useOffersData';
import { useOffersRealtime } from '@/hooks/offers/useOffersRealtime';

export const useFreelancerOffers = () => {
  const { offers, loading, loadOffers } = useOffersData();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    console.log('🚀 Hook de ofertas montado, carregando ofertas...');
    console.log('🔍 Refresh key atual:', refreshKey);
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
      setRefreshKey(prev => {
        const newKey = prev + 1;
        console.log('🔄 Atualizando refresh key de', prev, 'para', newKey);
        return newKey;
      });
    };

    window.addEventListener('newOfferCreated', handleNewOffer);
    return () => window.removeEventListener('newOfferCreated', handleNewOffer);
  }, []);

  // Log quando as ofertas mudarem
  useEffect(() => {
    console.log('📊 Estado das ofertas atualizado:', {
      count: offers.length,
      loading,
      offers: offers.map(o => ({ id: o.id, name: o.name, title: o.offerDetails?.title }))
    });
  }, [offers, loading]);

  return {
    offers,
    loading,
    reloadOffers: () => {
      console.log('🔄 Recarregamento manual das ofertas...');
      setRefreshKey(prev => {
        const newKey = prev + 1;
        console.log('🔄 Manual reload: atualizando refresh key de', prev, 'para', newKey);
        return newKey;
      });
    },
  };
};
