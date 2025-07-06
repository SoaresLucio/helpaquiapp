import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Professional } from '@/data/mockData';

interface FreelancerOffer {
  id: string;
  title: string;
  description: string;
  categories: string[];
  custom_categories?: string[];
  rate: string;
  location?: string;
  photos?: string[];
  is_active: boolean;
  freelancer_id: string;
  created_at: string;
  updated_at: string;
}

export const useFreelancerOffers = () => {
  const [freelancers, setFreelancers] = useState<FreelancerOffer[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFreelancers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('freelancer_service_offers')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const offers = data || [];
      setFreelancers(offers);

      // Mapear dados para o formato Professional esperado pelos componentes
      const mappedProfessionals: Professional[] = offers.map(offer => ({
        id: `${offer.freelancer_id}/${offer.id}`, // Formato: freelancer_id/offer_id
        name: offer.title,
        avatar: offer.photos?.[0] || '/placeholder.svg',
        rating: 4.5, // Valor padrão por enquanto
        ratingCount: 0, // Valor padrão por enquanto
        categories: offer.categories,
        description: offer.description,
        price: offer.rate,
        location: { lat: 0, lng: 0 }, // Valores padrão por enquanto
        distance: offer.location || 'Não informado',
        available: true,
        portfolio: offer.photos || [],
        isVerified: false,
        responseTime: '2h',
        responseRate: 95
      }));

      setProfessionals(mappedProfessionals);
    } catch (err) {
      console.error('Erro ao buscar freelancers:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFreelancers();
  }, []);

  // Escutar mudanças em tempo real
  useEffect(() => {
    const channel = supabase
      .channel('freelancer_service_offers')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'freelancer_service_offers'
        },
        () => {
          fetchFreelancers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    offers: professionals, // Dados formatados para os componentes existentes
    loading: isLoading,
    reloadOffers: fetchFreelancers,
    freelancers,
    professionals,
    isLoading,
    error,
    refetch: fetchFreelancers
  };
};