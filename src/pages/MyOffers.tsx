
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import BackButton from '@/components/ui/back-button';
import Footer from '@/components/Footer';
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
  if (userType !== 'freelancer') {
    navigate('/');
    return null;
  }

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      
      <div className="container mx-auto px-4 py-8 flex-1">
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
      
      <Footer />
    </div>
  );
};

export default MyOffers;
