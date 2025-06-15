
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseOffersRealtimeOptimizedProps {
  onOffersChange: () => void;
  enabled?: boolean;
}

export const useOffersRealtimeOptimized = ({ 
  onOffersChange, 
  enabled = true 
}: UseOffersRealtimeOptimizedProps) => {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled) {
      console.log('🚫 useOffersRealtimeOptimized: Realtime desabilitado');
      return;
    }

    console.log('🔄 useOffersRealtimeOptimized: Configurando realtime');

    // Criar canal realtime
    channelRef.current = supabase
      .channel('freelancer_service_offers_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'freelancer_service_offers'
        },
        (payload) => {
          console.log('📡 useOffersRealtimeOptimized: Mudança detectada:', payload);
          onOffersChange();
        }
      )
      .subscribe((status) => {
        console.log('📡 useOffersRealtimeOptimized: Status da inscrição:', status);
      });

    // Cleanup
    return () => {
      if (channelRef.current) {
        console.log('🧹 useOffersRealtimeOptimized: Limpando canal realtime');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [onOffersChange, enabled]);

  return null;
};
