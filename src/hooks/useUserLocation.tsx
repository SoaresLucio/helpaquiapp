
import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useUserLocation = () => {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const saveLocation = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      
      supabase
        .from('user_locations')
        .upsert({
          user_id: user.id,
          email: user.email || '',
          latitude,
          longitude,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
        .then(({ error }) => {
          if (error) console.error('Error saving location:', error);
        });
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(saveLocation, 
        (err) => console.log('Geolocation not available:', err.message),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, [user?.id, isAuthenticated]);
};
