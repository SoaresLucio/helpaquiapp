
import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useUserLocation = () => {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const fetchIpAndSaveLocation = async (latitude: number, longitude: number) => {
      let ipAddress: string | null = null;
      try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        ipAddress = data.ip || null;
      } catch {
        console.log('Could not fetch IP address');
      }

      const { error } = await supabase
        .from('user_locations')
        .upsert({
          user_id: user.id,
          email: user.email || '',
          latitude,
          longitude,
          ip_address: ipAddress,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) console.error('Error saving location:', error);
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchIpAndSaveLocation(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          console.log('Geolocation not available:', err.message);
          // Even without geolocation, save IP with 0,0 coords
          fetchIpAndSaveLocation(0, 0);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      // No geolocation support, still save IP
      fetchIpAndSaveLocation(0, 0);
    }
  }, [user?.id, isAuthenticated]);
};
