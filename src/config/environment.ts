import { supabase } from '@/integrations/supabase/client';

// Environment configuration for secure API key management
class EnvironmentConfig {
  private static _googleMapsApiKey: string | null = null;
  
  static async getGoogleMapsApiKey(): Promise<string> {
    if (this._googleMapsApiKey) {
      return this._googleMapsApiKey;
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('get-secret', {
        body: { name: 'GOOGLE_MAPS_API_KEY' }
      });
      
      if (error) {
        console.error('Error fetching Google Maps API key:', error);
        return 'YOUR_GOOGLE_MAPS_API_KEY_HERE';
      }
      
      this._googleMapsApiKey = data.value || 'YOUR_GOOGLE_MAPS_API_KEY_HERE';
      return this._googleMapsApiKey;
    } catch (error) {
      console.error('Error fetching Google Maps API key:', error);
      return 'YOUR_GOOGLE_MAPS_API_KEY_HERE';
    }
  }
}

export const config = {
  googleMaps: {
    // API key will be fetched from Supabase secrets
    getApiKey: () => EnvironmentConfig.getGoogleMapsApiKey(),
  },
  app: {
    environment: 'development',
  }
} as const;