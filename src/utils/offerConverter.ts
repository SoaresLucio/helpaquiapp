
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
    description: offer.title + (offer.description ? ` - ${offer.description}` : ''),
    categories: allCategories,
    rating: rating,
    ratingCount: ratingCount,
    price: offer.rate,
    distance: `${(Math.random() * 10 + 1).toFixed(1)}km`, // Mock - pode ser implementado com geolocalização
    avatar: profile?.avatar_url || '/placeholder.svg',
    isVerified: profile?.verified || false,
    location: { // Mock - pode ser implementado com coordenadas reais
      lat: -23.5505 + (Math.random() - 0.5) * 0.1,
      lng: -46.6333 + (Math.random() - 0.5) * 0.1
    },
    available: true,
    portfolio: offer.photos || [],
    responseTime: '30min', // Mock - pode ser calculado baseado em histórico
    responseRate: 95, // Mock - pode ser calculado baseado em histórico
    rating_count: ratingCount,
    reviews: [], // Pode ser expandido para incluir reviews reais
    // Informações adicionais da oferta
    offerDetails: {
      title: offer.title,
      fullDescription: offer.description,
      location: offer.location,
      customCategories: offer.custom_categories || [],
      createdAt: offer.created_at,
      isActive: offer.is_active
    }
  };

  console.log('🔄 Oferta convertida para Professional:', convertedOffer);
  return convertedOffer;
};
