
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

interface SolicitanteHomeProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const SolicitanteHome: React.FC<SolicitanteHomeProps> = ({ 
  selectedCategory, 
  onSelectCategory 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [filterRating, setFilterRating] = useState('all');
  
  // Hook para buscar banners promocionais
  const { banners, loading: bannersLoading, error: bannersError } = usePromotionalBanners('solicitante');

  // Hook para buscar ofertas de freelancers
  const { offers: allProfessionals, loading: loadingOffers, reloadOffers } = useFreelancerOffers();

  // Hook para filtrar e ordenar profissionais
  const { filteredProfessionals, selectedCategoryName } = useProfessionalFiltering({
    professionals: allProfessionals,
    selectedCategory,
    searchTerm,
    filterRating,
    sortBy
  });

  const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Usuário';

  return (
    <div className="space-y-6">
      {/* Banner promocional */}
      <div className="mb-6">
        {bannersLoading && (
          <div className="bg-gray-200 animate-pulse rounded-xl h-[300px] md:h-[400px] flex items-center justify-center">
            <p className="text-gray-500">Carregando banners...</p>
          </div>
        )}
        
        {!bannersLoading && bannersError && (
          <div className="bg-red-100 border border-red-300 rounded-xl p-4">
            <p className="text-red-700">Erro ao carregar banners: {bannersError}</p>
          </div>
        )}
        
        {!bannersLoading && !bannersError && banners.length > 0 && (
          <BannerCarousel banners={banners} className="rounded-xl shadow-lg" />
        )}
        
        {!bannersLoading && !bannersError && banners.length === 0 && (
          <div className="bg-gray-100 border border-gray-300 rounded-xl p-4 text-center">
            <p className="text-gray-600">Nenhum banner promocional disponível no momento.</p>
          </div>
        )}
      </div>

      {/* Welcome Section */}
      <WelcomeSection
        userName={userName}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortBy}
        onSortChange={setSortBy}
        filterRating={filterRating}
        onFilterRatingChange={setFilterRating}
      />

      <QuickActions />

      <ServiceMap selectedCategory={selectedCategory} />

      {/* Freelancers List */}
      <OffersSection
        selectedCategoryName={selectedCategoryName}
        professionals={filteredProfessionals.slice(0, 5)}
        loading={loadingOffers}
        onReload={reloadOffers}
      />

      {filteredProfessionals.length > 5 && (
        <div className="text-center">
          <Button onClick={() => navigate('/offers')}>
            Ver todas as ofertas
          </Button>
        </div>
      )}
    </div>
  );
};

export default SolicitanteHome;
