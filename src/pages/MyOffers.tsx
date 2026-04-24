
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import BackButton from '@/components/ui/back-button';
import { useAuth } from '@/hooks/useAuth';
import { useMyOffers } from '@/hooks/useMyOffers';
import MyOffersHeader from '@/components/offers/MyOffersHeader';
import EmptyOffersState from '@/components/offers/EmptyOffersState';
import OfferCard from '@/components/offers/OfferCard';
import LoadingState from '@/components/offers/LoadingState';

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
};

const MyOffers: React.FC = () => {
  const navigate = useNavigate();
  const { userType } = useAuth();
  const { offers, loading, deleteOffer } = useMyOffers();

  React.useEffect(() => {
    if (userType && userType !== 'freelancer') navigate('/dashboard');
  }, [userType, navigate]);

  if (!userType || userType !== 'freelancer' || loading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="container mx-auto px-4 py-8">
        <div className="mb-6"><BackButton to="/dashboard" label="Voltar ao Início" /></div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <MyOffersHeader />
        </motion.div>
        {offers.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
            <EmptyOffersState />
          </motion.div>
        ) : (
          <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-4">
            {offers.map((offer) => (
              <motion.div key={offer.id} variants={fadeUp}>
                <OfferCard offer={offer} onDelete={deleteOffer} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default MyOffers;
