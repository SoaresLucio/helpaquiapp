
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export const usePromotionalBanners = (targetAudience: 'solicitante' | 'freelancer' | 'empresa') => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        setError(null);

        if (process.env.NODE_ENV === 'development') {
        }

        // Fetch filtered banners
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

        setBanners(data || []);
      } catch (err) {
        console.error('Unexpected error fetching banners:', err);
        setError('Erro inesperado ao carregar banners');
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, [targetAudience]);

  return { banners, loading, error };
};
