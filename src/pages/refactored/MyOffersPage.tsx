
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/common/PageContainer';
import BackButton from '@/components/ui/back-button';
import { useAuth } from '@/hooks/useAuth';
import { useMyOffers } from '@/hooks/useMyOffers';
import MyOffersHeader from '@/components/offers/MyOffersHeader';
import EmptyOffersState from '@/components/offers/EmptyOffersState';
import OfferCard from '@/components/offers/OfferCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const MyOffersPage: React.FC = () => {
  const navigate = useNavigate();
  const { userType } = useAuth();
  const { offers, loading, deleteOffer } = useMyOffers();

  if (userType !== 'freelancer') {
    navigate('/');
    return null;
  }

  if (loading) {
    return (
      <PageContainer>
        <LoadingSpinner text="Carregando ofertas..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
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
    </PageContainer>
  );
};

export default MyOffersPage;
