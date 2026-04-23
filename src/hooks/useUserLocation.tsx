
import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useUserLocation = () => {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const saveLocation = async (latitude: number, longitude: number) => {
      let ipAddress: string | null = null;
      try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        ipAddress = data.ip || null;
      } catch {
        // IP fetch failed, continue without it
      }

      try {
        await (supabase as any)
          .from('user_locations')
          .upsert({
            user_id: user.id,
            email: user.email || '',
            latitude,
            longitude,
            ip_address: ipAddress,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });
      } catch {
        // Silently handle RLS or network errors
      }
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => saveLocation(position.coords.latitude, position.coords.longitude),
        () => saveLocation(0, 0),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      saveLocation(0, 0);
    }
  }, [user?.id, isAuthenticated]);
};
