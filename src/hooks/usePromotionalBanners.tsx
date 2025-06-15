import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PromotionalBanner {
  id: string;
  title: string;
  image_url: string;
  link_url?: string;
  cta_text?: string;
  target_audience: string;
  display_order: number;
  is_active: boolean;
}

/**
 * Hook para gerenciar banners promocionais
 * Busca e filtra banners baseado no público-alvo
 * 
 * @param targetAudience - Público-alvo dos banners ('solicitante' | 'freelancer' | 'all')
 * @returns Banners, estado de carregamento e possíveis erros
 */
export const usePromotionalBanners = (targetAudience: string) => {
  const [banners, setBanners] = useState<PromotionalBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBanners = async () => {
      console.log('🎨 Buscando banners promocionais para:', targetAudience);
      
      try {
        setLoading(true);
        setError(null);

        // Buscar banners ativos para o público-alvo específico ou geral
        const { data, error: supabaseError } = await supabase
          .from('promotional_banners')
          .select('*')
          .eq('is_active', true)
          .in('target_audience', [targetAudience, 'all'])
          .order('display_order', { ascending: true });

        if (supabaseError) {
          console.error('❌ Erro ao buscar banners:', supabaseError);
          throw supabaseError;
        }

        console.log('✅ Banners carregados:', data?.length || 0);
        setBanners(data || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar banners';
        console.error('❌ Erro:', errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, [targetAudience]);

  /**
   * Recarrega os banners
   */
  const refetchBanners = () => {
    setBanners([]);
    setError(null);
    // Re-executar o useEffect
  };

  return {
    banners,
    loading,
    error,
    refetchBanners
  };
};
