
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BackButton from '@/components/ui/back-button';
import SolicitanteSubscriptionPlans from '@/components/subscription/SolicitanteSubscriptionPlans';
import BannerCarousel from '@/components/banners/BannerCarousel';
import Footer from '@/components/common/Footer';
import { usePromotionalBanners } from '@/hooks/usePromotionalBanners';

const SolicitantePlans: React.FC = () => {
  const { banners, loading: bannersLoading } = usePromotionalBanners('solicitante');

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <BackButton to="/" label="Voltar ao Início" />
        </div>
        
        {/* Banner promocional */}
        {!bannersLoading && banners.length > 0 && (
          <div className="mb-8">
            <BannerCarousel banners={banners} />
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 text-center mb-2">
            Planos para Solicitantes
          </h1>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto">
            Escolha o plano ideal e solicite serviços dos melhores profissionais da sua região.
          </p>
        </div>

        <SolicitanteSubscriptionPlans />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-2xl mr-2">🔍</span>
                Encontre Profissionais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Acesse uma rede de profissionais qualificados e verificados. 
                Compare propostas e escolha a melhor opção para suas necessidades.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-2xl mr-2">💰</span>
                Preços Transparentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Receba orçamentos detalhados e compare preços antes de contratar. 
                Sem surpresas, tudo transparente e justo.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-2xl mr-2">📱</span>
                Acompanhe em Tempo Real
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Receba notificações sobre suas solicitações e acompanhe 
                o progresso dos serviços através do nosso chat integrado.
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Footer />
      </div>
    </div>
  );
};

export default SolicitantePlans;
