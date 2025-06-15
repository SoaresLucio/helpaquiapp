
import React, { useState, useEffect } from 'react';
import { MapPin, Star, Filter, Clock, Search, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ProfessionalCard from '@/components/ProfessionalCard';
import ServiceMap from '@/components/ServiceMap';
import BannerCarousel from '@/components/banners/BannerCarousel';
import { mockProfessionals, serviceCategories } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePromotionalBanners } from '@/hooks/usePromotionalBanners';
import { supabase } from '@/integrations/supabase/client';

interface SolicitanteHomeProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const SolicitanteHome: React.FC<SolicitanteHomeProps> = ({ selectedCategory, onSelectCategory }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [filterRating, setFilterRating] = useState('all');
  const [allProfessionals, setAllProfessionals] = useState(mockProfessionals);
  const [loadingOffers, setLoadingOffers] = useState(false);
  
  // Hook para buscar banners promocionais - SEMPRE buscar para solicitante
  const { banners, loading: bannersLoading, error: bannersError } = usePromotionalBanners('solicitante');

  // Debug logs para verificar banners
  useEffect(() => {
    console.log('SolicitanteHome - Banner status:', { 
      banners, 
      bannersLoading, 
      bannersError,
      bannersCount: banners?.length || 0
    });
  }, [banners, bannersLoading, bannersError]);

  // Load freelancer offers from Supabase
  useEffect(() => {
    const loadFreelancerOffers = async () => {
      setLoadingOffers(true);
      try {
        const { data: offers, error } = await supabase
          .from('freelancer_service_offers')
          .select(`
            *,
            profiles!freelancer_id (
              first_name,
              last_name,
              avatar_url
            )
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao carregar ofertas:', error);
          return;
        }

        // Convert freelancer offers to professional format
        const convertedOffers = offers?.map((offer: any) => {
          const profile = offer.profiles;
          const fullName = profile?.first_name && profile?.last_name 
            ? `${profile.first_name} ${profile.last_name}`.trim()
            : 'Freelancer';

          // Combine standard and custom categories
          const allCategories = [...(offer.categories || []), ...(offer.custom_categories || [])];

          return {
            id: offer.id,
            name: fullName,
            description: offer.description,
            categories: allCategories,
            rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0 for now
            ratingCount: Math.floor(Math.random() * 50) + 10,
            price: offer.rate,
            distance: `${(Math.random() * 10 + 1).toFixed(1)}km`,
            avatar: profile?.avatar_url || '/placeholder.svg',
            verified: true,
            location: offer.location || 'São Paulo, SP',
            available: true, // Add missing required property
            portfolio: [] // Add missing required property
          };
        }) || [];

        // Combine mock professionals with real freelancer offers
        setAllProfessionals([...mockProfessionals, ...convertedOffers]);
      } catch (error) {
        console.error('Erro ao carregar ofertas:', error);
      } finally {
        setLoadingOffers(false);
      }
    };

    loadFreelancerOffers();
  }, []);

  // Filtrar freelancers por categoria, pesquisa e rating
  const filteredProfessionals = allProfessionals.filter(pro => {
    const matchesCategory = !selectedCategory || pro.categories.includes(selectedCategory);
    const matchesSearch = !searchTerm || 
      pro.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pro.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = filterRating === 'all' || 
      (filterRating === '4+' && pro.rating >= 4) ||
      (filterRating === '4.5+' && pro.rating >= 4.5);
    
    return matchesCategory && matchesSearch && matchesRating;
  });

  // Ordenar freelancers
  const sortedProfessionals = [...filteredProfessionals].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'distance':
        return parseFloat(a.distance) - parseFloat(b.distance);
      case 'price':
        return parseFloat(a.price.replace(/[^\d,]/g, '').replace(',', '.')) - 
               parseFloat(b.price.replace(/[^\d,]/g, '').replace(',', '.'));
      default:
        return 0;
    }
  });

  const selectedCategoryName = selectedCategory 
    ? serviceCategories.find(cat => cat.id === selectedCategory)?.name 
    : null;

  const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Usuário';

  return (
    <div className="space-y-6">
      {/* Banner promocional - SEMPRE RENDERIZAR ESTA SEÇÃO */}
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
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Bem-vindo ao HelpAqui, {userName}! 👋
        </h1>
        <p className="text-gray-600 mb-4">
          Encontre freelancers qualificados próximos a você
        </p>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Pesquisar freelancers ou serviços..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Melhor avaliação</SelectItem>
              <SelectItem value="distance">Mais próximo</SelectItem>
              <SelectItem value="price">Menor preço</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterRating} onValueChange={setFilterRating}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filtrar por nota" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as notas</SelectItem>
              <SelectItem value="4+">4+ estrelas</SelectItem>
              <SelectItem value="4.5+">4.5+ estrelas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesse rapidamente as funcionalidades principais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline"
              onClick={() => navigate('/jobs')}
              className="h-16 flex flex-col gap-1"
            >
              <Search className="h-5 w-5" />
              Buscar Serviços
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/payments')}
              className="h-16 flex flex-col gap-1 bg-blue-50 hover:bg-blue-100 border-blue-200"
            >
              <CreditCard className="h-5 w-5" />
              Pagamentos
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/profile')}
              className="h-16 flex flex-col gap-1"
            >
              <Clock className="h-5 w-5" />
              Meu Perfil
            </Button>
          </div>
        </CardContent>
      </Card>

      <ServiceMap selectedCategory={selectedCategory} />

      {/* Freelancers List */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {selectedCategoryName 
              ? `Freelancers de ${selectedCategoryName}` 
              : 'Freelancers Recomendados'}
          </h2>
          
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <MapPin className="h-4 w-4" />
            <span>
              {loadingOffers ? 'Carregando...' : `${sortedProfessionals.length} profissionais encontrados`}
            </span>
          </div>
        </div>
        
        {loadingOffers ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto animate-spin" />
            </div>
            <p className="text-gray-500">Carregando ofertas de freelancers...</p>
          </div>
        ) : sortedProfessionals.length > 0 ? (
          <div className="space-y-4">
            {sortedProfessionals.map(professional => (
              <ProfessionalCard 
                key={professional.id} 
                professional={professional}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-gray-500 mb-4">
              Nenhum freelancer encontrado com os filtros aplicados.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                onSelectCategory(null);
                setSearchTerm('');
                setFilterRating('all');
              }}
            >
              Limpar filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SolicitanteHome;
