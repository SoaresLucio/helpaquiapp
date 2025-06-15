
import { useState, useEffect } from 'react';
import { useOffersData } from '@/hooks/offers/useOffersData';
import { useOffersRealtime } from '@/hooks/offers/useOffersRealtime';

export const useFreelancerOffers = () => {
  const { offers, loading, loadOffers } = useOffersData();

  useEffect(() => {
    console.log('🚀 Hook de ofertas montado, carregando ofertas...');
    loadOffers();
  }, [loadOffers]);

  useOffersRealtime({ onOffersChange: loadOffers });

  return {
    offers,
    loading,
    reloadOffers: loadOffers,
  };
};
