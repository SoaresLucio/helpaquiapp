// Environment configuration for secure API key management
export const config = {
  googleMaps: {
    // In production, this should be set via environment variables
    // For now, using a placeholder - the user should add their own API key
    apiKey: process.env.GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY_HERE",
  },
  app: {
    environment: process.env.NODE_ENV || 'development',
  }
} as const;

// Security validation
if (config.googleMaps.apiKey === "YOUR_GOOGLE_MAPS_API_KEY_HERE" && config.app.environment === 'production') {
  console.warn("⚠️  WARNING: Google Maps API key not configured for production!");
}