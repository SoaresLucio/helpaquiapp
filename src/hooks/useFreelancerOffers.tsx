
import { useState, useEffect } from 'react';
import { useOffersData } from '@/hooks/offers/useOffersData';
import { useOffersRealtime } from '@/hooks/offers/useOffersRealtime';

export const useFreelancerOffers = () => {
  const { offers, loading, loadOffers } = useOffersData();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    console.log('🚀 useFreelancerOffers: Hook montado, carregando ofertas...');
    console.log('🔍 useFreelancerOffers: Refresh key atual:', refreshKey);
    loadOffers();
  }, [loadOffers, refreshKey]);

  // Escutar mudanças em tempo real
  useOffersRealtime({ 
    onOffersChange: () => {
      console.log('🔄 useFreelancerOffers: Recarregando ofertas devido a mudança em tempo real...');
      loadOffers();
    }
  });

  // Escutar evento customizado para novas ofertas
  useEffect(() => {
    const handleNewOffer = () => {
      console.log('🆕 useFreelancerOffers: Nova oferta detectada, recarregando...');
      setRefreshKey(prev => {
        const newKey = prev + 1;
        console.log('🔄 useFreelancerOffers: Atualizando refresh key de', prev, 'para', newKey);
        return newKey;
      });
    };

    console.log('👂 useFreelancerOffers: Configurando listener para newOfferCreated');
    window.addEventListener('newOfferCreated', handleNewOffer);
    
    return () => {
      console.log('🧹 useFreelancerOffers: Removendo listener para newOfferCreated');
      window.removeEventListener('newOfferCreated', handleNewOffer);
    };
  }, []);

  // Atualização automática a cada 55 segundos
  useEffect(() => {
    console.log('⏰ useFreelancerOffers: Configurando atualização automática a cada 55 segundos');
    
    const interval = setInterval(() => {
      console.log('🔄 useFreelancerOffers: Atualização automática das ofertas (55s)');
      setRefreshKey(prev => {
        const newKey = prev + 1;
        console.log('⏰ useFreelancerOffers: Auto-refresh: atualizando refresh key de', prev, 'para', newKey);
        return newKey;
      });
    }, 55000); // 55 segundos

    return () => {
      console.log('🧹 useFreelancerOffers: Removendo interval de atualização automática');
      clearInterval(interval);
    };
  }, []);

  // Log quando as ofertas mudarem
  useEffect(() => {
    console.log('📊 useFreelancerOffers: Estado das ofertas atualizado:', {
      count: offers.length,
      loading,
      offers: offers.map(o => ({ id: o.id, name: o.name, title: o.offerDetails?.title }))
    });
  }, [offers, loading]);

  // Debug: detectar re-renders excessivos
  useEffect(() => {
    console.log('🔄 useFreelancerOffers: Component re-rendered');
  });

  return {
    offers,
    loading,
    reloadOffers: () => {
      console.log('🔄 useFreelancerOffers: Recarregamento manual das ofertas...');
      setRefreshKey(prev => {
        const newKey = prev + 1;
        console.log('🔄 useFreelancerOffers: Manual reload: atualizando refresh key de', prev, 'para', newKey);
        return newKey;
      });
    },
  };
};
