
import React from 'react';
import BannerCarousel from '@/components/banners/BannerCarousel';
import { usePromotionalBanners } from '@/hooks/usePromotionalBanners';

const FreelancerPromotionalBanner: React.FC = () => {
  const { banners, loading: bannersLoading, error: bannersError } = usePromotionalBanners('freelancer');

  return (
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
  );
};

export default FreelancerPromotionalBanner;
