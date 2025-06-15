
import { Professional, serviceCategories } from '@/data/mockData';

// Cache para evitar recálculos
const locationCache = new Map<string, { lat: number; lng: number }>();
const distanceCache = new Map<string, string>();

const generateMockLocation = (id: string) => {
  if (locationCache.has(id)) {
    return locationCache.get(id)!;
  }
  
  const location = {
    lat: -23.5505 + (Math.random() - 0.5) * 0.1,
    lng: -46.6333 + (Math.random() - 0.5) * 0.1
  };
  
  locationCache.set(id, location);
  return location;
};

const generateMockDistance = (id: string) => {
  if (distanceCache.has(id)) {
    return distanceCache.get(id)!;
  }
  
  const distance = `${(Math.random() * 10 + 1).toFixed(1)}km`;
  distanceCache.set(id, distance);
  return distance;
};

export const convertOfferToProfessional = (offer: any): Professional => {
  const profile = offer.profiles;
  const fullName = profile?.first_name && profile?.last_name 
    ? `${profile.first_name} ${profile.last_name}`.trim()
    : profile?.first_name || profile?.last_name || 'Freelancer';

  const allCategories = [
    ...(Array.isArray(offer.categories) ? offer.categories : []),
    ...(Array.isArray(offer.custom_categories) ? offer.custom_categories : [])
  ];

  const ratingsData = offer.freelancer_ratings;
  const rating = ratingsData ? parseFloat(ratingsData.avg_rating) || 0 : 0;
  const ratingCount = ratingsData ? ratingsData.rating_count || 0 : 0;
  
  const convertedOffer: Professional = {
    id: `${offer.freelancer_id}/${offer.id}`,
    name: fullName,
    description: [offer.title, offer.description].filter(Boolean).join(' - '),
    categories: allCategories,
    rating: rating,
    ratingCount: ratingCount,
    price: offer.rate || 'A combinar',
    distance: generateMockDistance(offer.id),
    avatar: profile?.avatar_url || '/placeholder.svg',
    isVerified: profile?.verified || false,
    location: generateMockLocation(offer.id),
    available: true,
    portfolio: Array.isArray(offer.photos) ? offer.photos : [],
    responseTime: '30min',
    responseRate: 95,
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('🔄 Oferta convertida:', {
      id: convertedOffer.id,
      name: convertedOffer.name,
      categories: allCategories.length,
      hasProfile: !!profile
    });
  }
  
  return convertedOffer;
};

// Export the function that was missing
export const convertSupabaseToMockData = (offers: any[]): Professional[] => {
  return offers.map(convertOfferToProfessional);
};
