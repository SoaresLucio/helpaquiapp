
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ServiceMap from '@/components/ServiceMap';
import BannerCarousel from '@/components/banners/BannerCarousel';
import { useAuth } from '@/hooks/useAuth';
import { usePromotionalBanners } from '@/hooks/usePromotionalBanners';
import { useFreelancerOffers } from '@/hooks/useFreelancerOffers';
import { useProfessionalFiltering } from '@/hooks/useProfessionalFiltering';
import WelcomeSection from './WelcomeSection';
import QuickActions from './QuickActions';
import OffersSection from './OffersSection';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }
  })
};

interface SolicitanteHomeProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const SolicitanteHome: React.FC<SolicitanteHomeProps> = ({ selectedCategory, onSelectCategory }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [filterRating, setFilterRating] = useState('all');

  const { banners, loading: bannersLoading, error: bannersError } = usePromotionalBanners('solicitante');
  const { offers: allProfessionals, loading: loadingOffers, reloadOffers } = useFreelancerOffers();
  const { filteredProfessionals, selectedCategoryName } = useProfessionalFiltering({
    professionals: allProfessionals, selectedCategory, searchTerm, filterRating, sortBy
  });

  const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Usuário';

  return (
    <div className="space-y-6">
      {/* Banner */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
        {bannersLoading && (
          <div className="bg-muted animate-pulse rounded-2xl h-[300px] md:h-[400px] flex items-center justify-center">
            <p className="text-muted-foreground">Carregando banners...</p>
          </div>
        )}
        {!bannersLoading && bannersError && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-4">
            <p className="text-destructive">Erro ao carregar banners: {bannersError}</p>
          </div>
        )}
        {!bannersLoading && !bannersError && banners.length > 0 && (
          <BannerCarousel banners={banners} className="rounded-2xl shadow-lg" />
        )}
        {!bannersLoading && !bannersError && banners.length === 0 && (
          <div className="bg-muted border border-border/50 rounded-2xl p-4 text-center">
            <p className="text-muted-foreground">Nenhum banner promocional disponível no momento.</p>
          </div>
        )}
      </motion.div>

      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}>
        <WelcomeSection
          userName={userName}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortBy}
          onSortChange={setSortBy}
          filterRating={filterRating}
          onFilterRatingChange={setFilterRating}
        />
      </motion.div>

      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}>
        <QuickActions />
      </motion.div>

      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}>
        <ServiceMap selectedCategory={selectedCategory} />
      </motion.div>

      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}>
        <OffersSection
          selectedCategoryName={selectedCategoryName}
          professionals={filteredProfessionals.slice(0, 5)}
          loading={loadingOffers}
          onReload={reloadOffers}
        />
      </motion.div>

      {filteredProfessionals.length > 5 && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={5} className="text-center">
          <Button onClick={() => navigate('/offers')} className="gradient-primary text-white border-0 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl transition-all">
            Ver todas as ofertas
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default SolicitanteHome;
