
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseOffersRealtimeProps {
  onOffersChange: () => void;
}

export const useOffersRealtime = ({ onOffersChange }: UseOffersRealtimeProps) => {
  // Listen for new offers created via custom events
  useEffect(() => {
    const handleNewOffer = (event: CustomEvent) => {
      console.log('🆕 Nova oferta detectada via evento personalizado:', event.detail);
      onOffersChange();
    };

    window.addEventListener('newOfferCreated', handleNewOffer as EventListener);

    return () => {
      window.removeEventListener('newOfferCreated', handleNewOffer as EventListener);
    };
  }, [onOffersChange]);

  // Real-time updates from Supabase
  useEffect(() => {
    console.log('🔴 Configurando listeners de realtime...');
    
    const channel = supabase
      .channel('freelancer-offers-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'freelancer_service_offers'
        },
        (payload) => {
          console.log('🔄 Alteração em ofertas via realtime:', payload);
          onOffersChange();
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
          console.log('🔄 Alteração em reviews via realtime:', payload);
          onOffersChange();
        }
      )
      .subscribe((status) => {
        console.log('📡 Status da conexão realtime:', status);
        if (status === 'SUBSCRIBED') {
          // Initial load on successful subscription
          onOffersChange();
        }
      });

    return () => {
      console.log('🔌 Removendo channel realtime...');
      supabase.removeChannel(channel);
    };
  }, [onOffersChange]);
};
