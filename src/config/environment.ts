// Environment configuration for secure API key management
export const config = {
  googleMaps: {
    // Placeholder for Google Maps API key - will be set via Supabase secrets
    apiKey: "YOUR_GOOGLE_MAPS_API_KEY_HERE",
  },
  app: {
    environment: 'development',
  }
} as const;

// Security validation
if (config.googleMaps.apiKey === "YOUR_GOOGLE_MAPS_API_KEY_HERE") {
  console.warn("⚠️  WARNING: Google Maps API key not configured! Please add it via Supabase secrets.");
}