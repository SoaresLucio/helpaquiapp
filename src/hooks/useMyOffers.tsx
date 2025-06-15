
import { useEffect } from 'react';
import { useMyOffersData } from '@/hooks/offers/useMyOffersData';
import { useMyOffersRealtime } from '@/hooks/offers/useMyOffersRealtime';

export const useMyOffers = () => {
  const { offers, loading, loadOffers, deleteOffer } = useMyOffersData();

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  useMyOffersRealtime({ onOffersChange: loadOffers });

  return {
    offers,
    loading,
    deleteOffer,
    reloadOffers: loadOffers
  };
};
