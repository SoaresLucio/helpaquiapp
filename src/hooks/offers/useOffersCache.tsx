
import { useRef, useCallback } from 'react';
import { Professional } from '@/data/mockData';

interface CacheEntry {
  data: Professional[];
  timestamp: number;
  version: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const useOffersCache = () => {
  const cacheRef = useRef<CacheEntry | null>(null);
  const versionRef = useRef(0);

  const isCacheValid = useCallback(() => {
    if (!cacheRef.current) return false;
    const now = Date.now();
    return (now - cacheRef.current.timestamp) < CACHE_DURATION;
  }, []);

  const getCachedOffers = useCallback((): Professional[] | null => {
    if (isCacheValid()) {
      console.log('📚 useOffersCache: Retornando dados do cache');
      return cacheRef.current!.data;
    }
    return null;
  }, [isCacheValid]);

  const setCachedOffers = useCallback((offers: Professional[]) => {
    versionRef.current += 1;
    cacheRef.current = {
      data: offers,
      timestamp: Date.now(),
      version: versionRef.current
    };
    console.log('💾 useOffersCache: Cache atualizado com', offers.length, 'ofertas');
  }, []);

  const invalidateCache = useCallback(() => {
    cacheRef.current = null;
    console.log('🗑️ useOffersCache: Cache invalidado');
  }, []);

  const getCacheVersion = useCallback(() => versionRef.current, []);

  return {
    getCachedOffers,
    setCachedOffers,
    invalidateCache,
    isCacheValid,
    getCacheVersion
  };
};
