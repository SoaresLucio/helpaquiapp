
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import BackButton from '@/components/ui/back-button';
import { useAuth } from '@/hooks/useAuth';
import { useMyOffers } from '@/hooks/useMyOffers';
import MyOffersHeader from '@/components/offers/MyOffersHeader';
import EmptyOffersState from '@/components/offers/EmptyOffersState';
import OfferCard from '@/components/offers/OfferCard';
import LoadingState from '@/components/offers/LoadingState';

const MyOffers: React.FC = () => {
  const navigate = useNavigate();
  const { userType } = useAuth();
  const { offers, loading, deleteOffer } = useMyOffers();

  // Redirect if not freelancer
  React.useEffect(() => {
    if (userType && userType !== 'freelancer') {
      navigate('/dashboard');
    }
  }, [userType, navigate]);

  if (!userType || userType !== 'freelancer') {
    return <LoadingState />;
  }

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <BackButton to="/dashboard" label="Voltar ao Início" />
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
