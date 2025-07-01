
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

export const usePromotionalBanners = (targetAudience: 'solicitante' | 'freelancer') => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 Fetching banners for target audience:', targetAudience);

        // Primeiro, vamos buscar TODOS os banners para debug
        const { data: allBanners, error: allBannersError } = await supabase
          .from('promotional_banners')
          .select('*')
          .order('display_order', { ascending: true });

        if (allBannersError) {
          console.error('❌ Error fetching all banners:', allBannersError);
        } else {
          console.log('📊 ALL banners in database:', allBanners);
          console.log('📊 Total banners found:', allBanners?.length || 0);
          
          // Log detalhado de cada banner
          allBanners?.forEach((banner, index) => {
            console.log(`📋 Banner ${index + 1}:`, {
              id: banner.id,
              title: banner.title,
              target_audience: banner.target_audience,
              is_active: banner.is_active,
              image_url: banner.image_url
            });
          });
        }

        // Agora a query filtrada original
        const { data, error } = await supabase
          .from('promotional_banners')
          .select('*')
          .eq('is_active', true)
          .in('target_audience', [targetAudience, 'both'])
          .order('display_order', { ascending: true });

        if (error) {
          console.error('❌ Error fetching filtered banners:', error);
          setError(error.message);
          return;
        }

        console.log('✅ Filtered banners fetched successfully:', data);
        console.log('📊 Filtered banners count:', data?.length || 0);
        
        // Log detalhado dos banners filtrados
        data?.forEach((banner, index) => {
          console.log(`🎯 Filtered Banner ${index + 1}:`, {
            id: banner.id,
            title: banner.title,
            target_audience: banner.target_audience,
            is_active: banner.is_active,
            matches_target: [targetAudience, 'both'].includes(banner.target_audience)
          });
        });

        setBanners(data || []);
      } catch (err) {
        console.error('💥 Unexpected error fetching banners:', err);
        setError('Erro inesperado ao carregar banners');
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, [targetAudience]);

  return { banners, loading, error };
};
