import { secureApiManager } from '@/utils/secureApiManager';

// Environment configuration for secure API key management
class EnvironmentConfig {
  private static _googleMapsApiKey: string | null = null;
  
  static async getGoogleMapsApiKey(): Promise<string> {
    if (this._googleMapsApiKey) {
      return this._googleMapsApiKey;
    }
    
    try {
      const key = await secureApiManager.getApiKey('GOOGLE_MAPS_API_KEY');
      
      if (!key) {
        console.warn('Google Maps API key not found in Supabase secrets');
        return 'YOUR_GOOGLE_MAPS_API_KEY_HERE';
      }
      
      // Validate key format
      if (!secureApiManager.validateApiKeyFormat(key, 'google')) {
        console.warn('Invalid Google Maps API key format');
        return 'YOUR_GOOGLE_MAPS_API_KEY_HERE';
      }
      
      this._googleMapsApiKey = key;
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