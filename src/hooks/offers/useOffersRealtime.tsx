
import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseOffersRealtimeProps {
  onOffersChange: () => void;
}

export const useOffersRealtime = ({ onOffersChange }: UseOffersRealtimeProps) => {
  const channelRef = useRef<any>(null);
  const isConnectedRef = useRef(false);

  // Função memoizada para mudanças em ofertas
  const handleOffersChange = useCallback(() => {
    console.log('🔄 useOffersRealtime: Mudança detectada, atualizando ofertas...');
    onOffersChange();
  }, [onOffersChange]);

  // Listen for new offers created via custom events
  useEffect(() => {
    const handleNewOffer = (event: CustomEvent) => {
      console.log('🆕 Nova oferta detectada via evento personalizado:', event.detail);
      handleOffersChange();
    };

    window.addEventListener('newOfferCreated', handleNewOffer as EventListener);

    return () => {
      window.removeEventListener('newOfferCreated', handleNewOffer as EventListener);
    };
  }, [handleOffersChange]);

  // Real-time updates from Supabase (apenas uma conexão)
  useEffect(() => {
    // Evita criar múltiplas conexões
    if (isConnectedRef.current || channelRef.current) {
      return;
    }

    console.log('🔴 Configurando listeners de realtime...');
    
    const channel = supabase
      .channel('freelancer-offers-realtime-single')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'freelancer_service_offers'
        },
        (payload) => {
          console.log('🔄 Alteração em ofertas via realtime:', payload.eventType);
          handleOffersChange();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews'
        },
        (payload) => {
          console.log('🔄 Alteração em reviews via realtime:', payload.eventType);
          handleOffersChange();
        }
      )
      .subscribe((status) => {
        console.log('📡 Status da conexão realtime:', status);
        if (status === 'SUBSCRIBED') {
          isConnectedRef.current = true;
          console.log('✅ Realtime conectado com sucesso');
        } else if (status === 'CLOSED') {
          isConnectedRef.current = false;
        }
      });

    channelRef.current = channel;

    return () => {
      console.log('🔌 Removendo channel realtime...');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isConnectedRef.current = false;
      }
    };
  }, [handleOffersChange]);
};
