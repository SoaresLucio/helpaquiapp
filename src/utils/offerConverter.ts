
import { Professional, serviceCategories } from '@/data/mockData';

export const convertOfferToProfessional = (offer: any): Professional => {
  const profile = offer.profiles;
  const fullName = profile?.first_name && profile?.last_name 
    ? `${profile.first_name} ${profile.last_name}`.trim()
    : 'Freelancer';

  const allCategories = [...(offer.categories || []), ...(offer.custom_categories || [])];

  const ratingsData = offer.freelancer_ratings;
  const rating = ratingsData ? parseFloat(ratingsData.avg_rating) : 0;
  const ratingCount = ratingsData ? ratingsData.rating_count : 0;
  
  const convertedOffer: Professional = {
    id: `${offer.freelancer_id}/${offer.id}`,
    name: fullName,
    description: offer.description,
    categories: allCategories,
    rating: rating,
    ratingCount: ratingCount,
    price: offer.rate,
    distance: `${(Math.random() * 10 + 1).toFixed(1)}km`, // Mock
    avatar: profile?.avatar_url || '/placeholder.svg',
    isVerified: profile?.verified || false,
    location: { // Mock
      lat: -23.5505 + (Math.random() - 0.5) * 0.1,
      lng: -46.6333 + (Math.random() - 0.5) * 0.1
    },
    available: true, // Mock
    portfolio: [], // Mock
    responseTime: '30min', // Mock
    responseRate: 95, // Mock
    rating_count: ratingCount, // for compatibility
    reviews: [] // for compatibility
  };

  console.log('🔄 Oferta convertida:', convertedOffer);
  return convertedOffer;
};
