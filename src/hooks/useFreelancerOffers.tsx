
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Professional } from '@/data/mockData';

export const useFreelancerOffers = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFreelancerOffers = useCallback(async () => {
    setLoading(true);
    try {
      console.log('🔄 Carregando ofertas de freelancers...');
      
      const { data, error } = await supabase
        .from('freelancer_service_offers')
        .select(`
          *,
          profiles:profiles!inner(
            first_name,
            last_name,
            avatar_url,
            verified
          ),
          freelancer_ratings!left(
            avg_rating,
            rating_count
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao carregar ofertas com detalhes:', error);
        setOffers([]);
        return;
      }

      console.log('✅ Ofertas carregadas do Supabase:', data);

      const convertedOffers = data?.map((offer: any) => {
        const profile = offer.profiles;
        const fullName = profile?.first_name && profile?.last_name 
          ? `${profile.first_name} ${profile.last_name}`.trim()
          : 'Freelancer';

        const allCategories = [...(offer.categories || []), ...(offer.custom_categories || [])];

        const ratingsData = offer.freelancer_ratings;
        const rating = ratingsData ? parseFloat(ratingsData.avg_rating) : 0;
        const ratingCount = ratingsData ? ratingsData.rating_count : 0;
        
        const convertedOffer: Professional = {
          id: `${offer.freelancer_id}/${offer.id}`,
          name: fullName,
          description: offer.description,
          categories: allCategories,
          rating: rating,
          ratingCount: ratingCount,
          price: offer.rate,
          distance: `${(Math.random() * 10 + 1).toFixed(1)}km`, // Mock
          avatar: profile?.avatar_url || '/placeholder.svg',
          isVerified: profile?.verified || false,
          location: { // Mock
            lat: -23.5505 + (Math.random() - 0.5) * 0.1,
            lng: -46.6333 + (Math.random() - 0.5) * 0.1
          },
          available: true, // Mock
          portfolio: [], // Mock
          responseTime: '30min', // Mock
          responseRate: 95, // Mock
          rating_count: ratingCount, // for compatibility
          reviews: [] // for compatibility
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
  }, []);

  useEffect(() => {
    console.log('🚀 Hook de ofertas montado, carregando ofertas...');
    loadFreelancerOffers();
  }, [loadFreelancerOffers]);

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
  }, [loadFreelancerOffers]);

  // Real-time updates from Supabase
  useEffect(() => {
    console.log('🔴 Configurando listeners de realtime...');
    
    const channel = supabase
      .channel('freelancer-offers-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'freelancer_service_offers'
        },
        (payload) => {
          console.log('🔄 Alteração em ofertas via realtime:', payload);
          loadFreelancerOffers();
        }
      )
       .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews'
        },
        (payload) => {
          console.log('🔄 Alteração em reviews via realtime:', payload);
          loadFreelancerOffers();
        }
      )
      .subscribe((status) => {
        console.log('📡 Status da conexão realtime:', status);
        if (status === 'SUBSCRIBED') {
          // Initial load on successful subscription
          loadFreelancerOffers();
        }
      });

    return () => {
      console.log('🔌 Removendo channel realtime...');
      supabase.removeChannel(channel);
    };
  }, [loadFreelancerOffers]);

  return {
    offers,
    loading,
    reloadOffers: loadFreelancerOffers,
  };
};
