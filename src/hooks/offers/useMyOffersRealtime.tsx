
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UseMyOffersRealtimeProps {
  onOffersChange: () => void;
}

export const useMyOffersRealtime = ({ onOffersChange }: UseMyOffersRealtimeProps) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    if (process.env.NODE_ENV === 'development') {
      console.log('🔴 Configurando listeners de realtime para ofertas...');
    }
    
    const channel = supabase
      .channel('my-offers-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'freelancer_service_offers',
          filter: `freelancer_id=eq.${user.id}`
        },
        (payload) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('🔄 Mudança em realtime detectada:', payload);
          }
          onOffersChange();
        }
      )
      .subscribe((status) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('📡 Status da conexão realtime:', status);
        }
      });

    return () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔌 Removendo channel realtime...');
      }
      supabase.removeChannel(channel);
    };
  }, [user, onOffersChange]);
};
