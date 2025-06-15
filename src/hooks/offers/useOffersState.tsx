
import { useState, useCallback } from 'react';
import { Professional } from '@/data/mockData';

export const useOffersState = () => {
  const [offers, setOffers] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateOffers = useCallback((newOffers: Professional[]) => {
    setOffers(newOffers);
    setError(null);
  }, []);

  const setLoadingState = useCallback((isLoading: boolean) => {
    setLoading(isLoading);
  }, []);

  const setErrorState = useCallback((errorMessage: string | null) => {
    setError(errorMessage);
  }, []);

  const clearState = useCallback(() => {
    setOffers([]);
    setError(null);
    setLoading(false);
  }, []);

  return {
    offers,
    loading,
    error,
    updateOffers,
    setLoadingState,
    setErrorState,
    clearState
  };
};
