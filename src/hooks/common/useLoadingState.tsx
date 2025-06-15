
import { useState, useCallback } from 'react';

interface UseLoadingStateReturn {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  withLoading: <T>(fn: () => Promise<T>) => Promise<T>;
}

export const useLoadingState = (initialLoading = false): UseLoadingStateReturn => {
  const [loading, setLoading] = useState(initialLoading);

  const withLoading = useCallback(async <T,>(fn: () => Promise<T>): Promise<T> => {
    setLoading(true);
    try {
      return await fn();
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    setLoading,
    withLoading
  };
};
