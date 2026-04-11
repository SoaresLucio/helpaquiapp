
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import BackButton from '@/components/ui/back-button';
import { useFreelancerOffers } from '@/hooks/useFreelancerOffers';
import OffersSection from '@/components/solicitante/OffersSection';
import { useAuth } from '@/hooks/useAuth';

const OffersPage = () => {
  const { offers, loading, reloadOffers } = useFreelancerOffers();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="container mx-auto px-4 py-8">
        <div className="mb-6"><BackButton to="/dashboard" label="Voltar ao Início" /></div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2 text-foreground">Ofertas de Help Disponíveis</h1>
            <p className="text-muted-foreground">Encontre profissionais qualificados prontos para ajudar você</p>
          </div>
          <OffersSection selectedCategoryName={null} professionals={offers} loading={loading} onReload={reloadOffers} />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OffersPage;
