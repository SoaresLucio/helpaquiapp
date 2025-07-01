
import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseOffersRealtimeOptimizedProps {
  onOffersChange: () => void;
  enabled?: boolean;
}

export const useOffersRealtimeOptimized = ({ 
  onOffersChange, 
  enabled = true 
}: UseOffersRealtimeOptimizedProps) => {
  const channelRef = useRef<any>(null);
  const isConnectedRef = useRef(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleOffersChange = useCallback(() => {
    console.log('🔄 useOffersRealtimeOptimized: Mudança detectada');
    onOffersChange();
  }, [onOffersChange]);

  const connectRealtime = useCallback(() => {
    if (!enabled || isConnectedRef.current || channelRef.current) {
      return;
    }

    console.log('🔴 Configurando conexão realtime otimizada...');
    
    const channel = supabase
      .channel(`freelancer-offers-optimized-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'freelancer_service_offers'
        },
        (payload) => {
          console.log('🔄 Mudança em ofertas (realtime):', payload.eventType);
          handleOffersChange();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('🔄 Mudança em profiles (realtime):', payload.eventType);
          handleOffersChange();
        }
      )
      .subscribe((status) => {
        console.log('📡 Status da conexão realtime:', status);
        
        if (status === 'SUBSCRIBED') {
          isConnectedRef.current = true;
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          isConnectedRef.current = false;
          
          // Reconectar após 5 segundos em caso de erro
          if (enabled && !reconnectTimeoutRef.current) {
            reconnectTimeoutRef.current = setTimeout(() => {
              console.log('🔄 Tentando reconectar realtime...');
              reconnectTimeoutRef.current = null;
              disconnectRealtime();
              connectRealtime();
            }, 5000);
          }
        }
      });

    channelRef.current = channel;
  }, [enabled, handleOffersChange]);

  const disconnectRealtime = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (channelRef.current) {
      console.log('🔌 Desconectando realtime...');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      isConnectedRef.current = false;
    }
  }, []);

  // Conectar/desconectar baseado no estado enabled
  useEffect(() => {
    if (enabled) {
      connectRealtime();
    } else {
      disconnectRealtime();
    }

    return disconnectRealtime;
  }, [enabled, connectRealtime, disconnectRealtime]);

  // Listener para eventos customizados
  useEffect(() => {
    if (!enabled) return;

    const handleCustomEvent = (event: CustomEvent) => {
      console.log('🆕 Evento customizado detectado:', event.detail);
      handleOffersChange();
    };

    window.addEventListener('newOfferCreated', handleCustomEvent as EventListener);
    window.addEventListener('offerUpdated', handleCustomEvent as EventListener);
    window.addEventListener('offerDeleted', handleCustomEvent as EventListener);

    return () => {
      window.removeEventListener('newOfferCreated', handleCustomEvent as EventListener);
      window.removeEventListener('offerUpdated', handleCustomEvent as EventListener);
      window.removeEventListener('offerDeleted', handleCustomEvent as EventListener);
    };
  }, [enabled, handleOffersChange]);

  return {
    isConnected: isConnectedRef.current,
    reconnect: connectRealtime,
    disconnect: disconnectRealtime
  };
};
