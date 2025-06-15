
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface FreelancerOffer {
  id: string;
  name: string;
  description: string;
  categories: string[];
  rating: number;
  ratingCount: number;
  price: string;
  distance: string;
  avatar: string;
  verified: boolean;
  location: string;
  available: boolean;
  portfolio: string[];
}

export const useFreelancerOffers = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState<FreelancerOffer[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFreelancerOffers = async () => {
    setLoading(true);
    try {
      console.log('🔄 Carregando ofertas de freelancers...');
      console.log('👤 Usuário autenticado:', user?.id);
      
      // Primeiro, vamos testar uma query simples sem JOIN para verificar RLS
      const { data: simpleOffers, error: simpleError } = await supabase
        .from('freelancer_service_offers')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      console.log('🔍 Query simples - Resultado:', { simpleOffers, simpleError });

      if (simpleError) {
        console.error('❌ Erro na query simples:', simpleError);
      }

      // Agora tentamos a query com JOIN
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

      console.log('📊 Query com JOIN - Resultado:', { offers, error });
      console.log('📊 Total de ofertas encontradas:', offers?.length || 0);

      if (error) {
        console.error('❌ Erro ao carregar ofertas:', error);
        
        // Se houver erro, vamos usar os dados da query simples
        if (simpleOffers && simpleOffers.length > 0) {
          console.log('🔄 Usando dados da query simples como fallback');
          const fallbackOffers = simpleOffers.map((offer: any) => ({
            id: `offer-${offer.id}`,
            name: 'Freelancer',
            description: offer.description,
            categories: [...(offer.categories || []), ...(offer.custom_categories || [])],
            rating: 4.5 + Math.random() * 0.5,
            ratingCount: Math.floor(Math.random() * 50) + 10,
            price: offer.rate,
            distance: `${(Math.random() * 10 + 1).toFixed(1)}km`,
            avatar: '/placeholder.svg',
            verified: true,
            location: offer.location || 'São Paulo, SP',
            available: true,
            portfolio: []
          }));
          
          console.log('✅ Ofertas convertidas (fallback):', fallbackOffers);
          setOffers(fallbackOffers);
          return;
        }
        
        setOffers([]);
        return;
      }

      console.log('✅ Ofertas carregadas do Supabase:', offers);

      // Convert freelancer offers to professional format
      const convertedOffers = offers?.map((offer: any) => {
        const profile = offer.profiles;
        const fullName = profile?.first_name && profile?.last_name 
          ? `${profile.first_name} ${profile.last_name}`.trim()
          : 'Freelancer';

        // Combine standard and custom categories
        const allCategories = [...(offer.categories || []), ...(offer.custom_categories || [])];

        const convertedOffer = {
          id: `offer-${offer.id}`,
          name: fullName,
          description: offer.description,
          categories: allCategories,
          rating: 4.5 + Math.random() * 0.5,
          ratingCount: Math.floor(Math.random() * 50) + 10,
          price: offer.rate,
          distance: `${(Math.random() * 10 + 1).toFixed(1)}km`,
          avatar: profile?.avatar_url || '/placeholder.svg',
          verified: true,
          location: offer.location || 'São Paulo, SP',
          available: true,
          portfolio: []
        };

        console.log('🔄 Oferta convertida:', convertedOffer);
        return convertedOffer;
      }) || [];

      console.log('✅ Ofertas convertidas finais:', convertedOffers);
      setOffers(convertedOffers);
      
    } catch (error) {
      console.error('💥 Erro inesperado ao carregar ofertas:', error);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🚀 Hook de ofertas montado, carregando ofertas...');
    loadFreelancerOffers();
  }, []);

  // Listen for new offers created via custom events
  useEffect(() => {
    const handleNewOffer = (event: CustomEvent) => {
      console.log('🆕 Nova oferta detectada via evento personalizado:', event.detail);
      loadFreelancerOffers();
    };

    window.addEventListener('newOfferCreated', handleNewOffer as EventListener);

    return () => {
      window.removeEventListener('newOfferCreated', handleNewOffer as EventListener);
    };
  }, []);

  // Real-time updates from Supabase
  useEffect(() => {
    console.log('🔴 Configurando listeners de realtime...');
    
    const channel = supabase
      .channel('freelancer-offers-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'freelancer_service_offers'
        },
        (payload) => {
          console.log('🆕 Nova oferta inserida via realtime:', payload);
          loadFreelancerOffers();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'freelancer_service_offers'
        },
        (payload) => {
          console.log('🔄 Oferta atualizada via realtime:', payload);
          loadFreelancerOffers();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'freelancer_service_offers'
        },
        (payload) => {
          console.log('🗑️ Oferta deletada via realtime:', payload);
          loadFreelancerOffers();
        }
      )
      .subscribe((status) => {
        console.log('📡 Status da conexão realtime:', status);
      });

    return () => {
      console.log('🔌 Removendo channel realtime...');
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    offers,
    loading,
    reloadOffers: loadFreelancerOffers
  };
};
