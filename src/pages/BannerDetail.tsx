import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import BackButton from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Calendar, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface BannerData {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  cta_text: string | null;
  target_audience: string;
  created_at: string;
}

const BannerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [banner, setBanner] = useState<BannerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanner = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from('promotional_banners')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        navigate('/dashboard', { replace: true });
        return;
      }
      setBanner(data);
      setLoading(false);
    };
    fetchBanner();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Skeleton className="h-8 w-40 mb-6" />
          <Skeleton className="h-[400px] w-full rounded-xl mb-6" />
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-6 w-48" />
        </div>
      </div>
    );
  }

  if (!banner) return null;

  const audienceLabel: Record<string, string> = {
    solicitante: 'Solicitantes',
    freelancer: 'Freelancers',
    empresa: 'Empresas',
    both: 'Todos os usuários',
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <BackButton to="/dashboard" label="Voltar" />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Banner image */}
          <div className="relative rounded-2xl overflow-hidden shadow-xl mb-8">
            <img
              src={banner.image_url}
              alt={banner.title}
              className="w-full h-[300px] md:h-[450px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>

          {/* Info */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 md:p-8 space-y-6">
              <h1 className="text-2xl md:text-4xl font-bold text-foreground">{banner.title}</h1>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {audienceLabel[banner.target_audience] || banner.target_audience}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {new Date(banner.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>

              {banner.link_url && (
                <Button
                  size="lg"
                  onClick={() => {
                    if (banner.link_url!.startsWith('/')) {
                      navigate(banner.link_url!);
                    } else {
                      window.open(banner.link_url!, '_blank', 'noopener,noreferrer');
                    }
                  }}
                  className="mt-4"
                >
                  {banner.cta_text || 'Saiba mais'}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default BannerDetail;
