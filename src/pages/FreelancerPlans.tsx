import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import FreelancerSubscriptionPlans from '@/components/subscription/FreelancerSubscriptionPlans';
import BannerCarousel from '@/components/banners/BannerCarousel';
import { useAccessControl } from '@/hooks/useAccessControl';
import { usePromotionalBanners } from '@/hooks/usePromotionalBanners';

const FreelancerPlans: React.FC = () => {
  const navigate = useNavigate();
  const { hasAccess, userType, loading } = useAccessControl({ 
    requiredUserType: 'freelancer' 
  });
  
  const { banners, loading: bannersLoading, error: bannersError } = usePromotionalBanners('freelancer');

  useEffect(() => {
    console.log('FreelancerPlans - Access check:', { hasAccess, userType, loading });
    console.log('FreelancerPlans - Banners:', { banners, bannersLoading, bannersError });
  }, [hasAccess, userType, loading, banners, bannersLoading, bannersError]);

  const handleBackToHome = () => {
    navigate('/', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-helpaqui-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
          <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header com botão de voltar */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={handleBackToHome}
            className="mb-4 flex items-center gap-2 text-helpaqui-green hover:text-helpaqui-green/80"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Início
          </Button>
        </div>

        {/* Banner promocional */}
        {!bannersLoading && banners.length > 0 && (
          <div className="mb-8">
            <BannerCarousel banners={banners} />
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 text-center mb-2">
            Planos para Freelancers
          </h1>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto">
            Encontre o plano ideal para expandir seus negócios e se conectar com mais clientes na sua região.
          </p>
        </div>

        <FreelancerSubscriptionPlans />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-2xl mr-2">💼</span>
                Mais Oportunidades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Acesse uma base crescente de clientes que procuram profissionais qualificados. 
                Aumente sua visibilidade e conquiste mais projetos.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-2xl mr-2">⭐</span>
                Destaque no Mercado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Apareça entre os profissionais recomendados da sua região. 
                Construa sua reputação e ganhe a confiança dos clientes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-2xl mr-2">📈</span>
                Crescimento Profissional
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Utilize nossas ferramentas de análise e dicas para melhorar seu desempenho. 
                Acompanhe seu progresso e otimize seus resultados.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FreelancerPlans;
