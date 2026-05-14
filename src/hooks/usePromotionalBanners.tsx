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

// Audiences considered "broadcast to everyone" — admins may use any of these.
const BROADCAST_AUDIENCES = ['both', 'all', 'todos', 'todas', 'ambos'];

export const usePromotionalBanners = (
  targetAudience: 'solicitante' | 'freelancer' | 'empresa'
) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchBanners = async () => {
      try {
        setError(null);

        const { data, error } = await supabase
          .from('promotional_banners')
          .select('*')
          .eq('is_active', true)
          .in('target_audience', [targetAudience, ...BROADCAST_AUDIENCES])
          .order('display_order', { ascending: true });

        if (cancelled) return;

        if (error) {
          console.error('Error fetching banners:', error);
          setError(error.message);
          return;
        }

        setBanners(data || []);
      } catch (err) {
        if (cancelled) return;
        console.error('Unexpected error fetching banners:', err);
        setError('Erro inesperado ao carregar banners');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchBanners();

    // Realtime: refetch when admin adds/edits/removes a banner
    const channel = supabase
      .channel(`promotional_banners_${targetAudience}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'promotional_banners' },
        () => fetchBanners()
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [targetAudience]);

  return { banners, loading, error };
};
