
import React from 'react';
import { useRouteProtection } from '@/hooks/useRouteProtection';
import Header from '@/components/Header';
import BackButton from '@/components/ui/back-button';
import MyOffersHeader from '@/components/offers/MyOffersHeader';
import EmptyOffersState from '@/components/offers/EmptyOffersState';
import OfferCard from '@/components/offers/OfferCard';
import LoadingState from '@/components/offers/LoadingState';
import { useMyOffers } from '@/hooks/useMyOffers';

const MyOffers: React.FC = () => {
  // Proteger a rota para apenas freelancers
  const { hasAccess, loading: authLoading } = useRouteProtection({
    requiredUserType: 'freelancer'
  });

  const { offers, loading: offersLoading, deleteOffer } = useMyOffers();

  // Show loading while checking authentication/authorization
  if (authLoading || !hasAccess) {
    return <LoadingState />;
  }

  // Show loading while fetching offers
  if (offersLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <BackButton to="/" label="Voltar ao Início" />
        </div>

        <MyOffersHeader />

        {offers.length === 0 ? (
          <EmptyOffersState />
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => (
              <OfferCard 
                key={offer.id} 
                offer={offer} 
                onDelete={deleteOffer}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOffers;
