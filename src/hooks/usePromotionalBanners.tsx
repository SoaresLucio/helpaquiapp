
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Banner {
  id: string;
  title: string;
  image_url: string;
  link_url?: string;
  cta_text?: string;
  target_audience: string;
  display_order: number;
  is_active: boolean;
}

export const usePromotionalBanners = (targetAudience: 'solicitante' | 'freelancer') => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userType } = useAuth();

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching banners for target audience:', targetAudience);
        console.log('Current user type:', userType);

        const { data, error } = await supabase
          .from('promotional_banners')
          .select('*')
          .eq('is_active', true)
          .in('target_audience', [targetAudience, 'both'])
          .order('display_order', { ascending: true });

        if (error) {
          console.error('Error fetching banners:', error);
          setError(error.message);
          return;
        }

        console.log('Banners fetched successfully:', data);
        setBanners(data || []);
      } catch (err) {
        console.error('Unexpected error fetching banners:', err);
        setError('Erro inesperado ao carregar banners');
      } finally {
        setLoading(false);
      }
    };

    // Buscar banners independente do userType para debugging
    fetchBanners();
  }, [targetAudience, userType]);

  return { banners, loading, error };
};
