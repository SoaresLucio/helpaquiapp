import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, ShieldCheck, Briefcase, Calendar } from 'lucide-react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PublicProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  user_type: string | null;
  verified: boolean;
  member_since: string;
  reviews_count: number;
  average_rating: number;
  services_completed: number;
}

interface PublicReview {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_first_name: string | null;
  reviewer_avatar_url: string | null;
}

const PublicProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [{ data: profileData, error: profileError }, { data: reviewsData }] = await Promise.all([
        supabase.rpc('get_public_profile', { p_user_id: userId }),
        supabase.rpc('get_public_reviews', { p_freelancer_id: userId, p_limit: 20 }),
      ]);
      if (cancelled) return;
      if (profileError || !profileData || profileData.length === 0) {
        toast.error('Perfil não encontrado');
        navigate(-1);
        return;
      }
      setProfile(profileData[0] as PublicProfile);
      setReviews((reviewsData ?? []) as PublicReview[]);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [userId, navigate]);

  const fullName = profile ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() || 'Usuário' : '';
  const initials = fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <motion.main initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="container mx-auto px-4 py-6 max-w-3xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>

        {loading || !profile ? (
          <Card><CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
            <Skeleton className="h-24 w-full" />
          </CardContent></Card>
        ) : (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.avatar_url ?? undefined} alt={fullName} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                      <h1 className="text-2xl font-bold text-foreground">{fullName}</h1>
                      {profile.verified && (
                        <Badge variant="secondary" className="gap-1">
                          <ShieldCheck className="h-3 w-3" /> Verificado
                        </Badge>
                      )}
                    </div>
                    {profile.user_type && (
                      <Badge variant="outline" className="capitalize">{profile.user_type}</Badge>
                    )}
                    <div className="flex items-center justify-center sm:justify-start gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Membro desde {new Date(profile.member_since).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-2xl font-bold text-foreground">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      {Number(profile.average_rating).toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Avaliação média</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{profile.reviews_count}</div>
                    <div className="text-xs text-muted-foreground mt-1">Avaliações</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-2xl font-bold text-foreground">
                      <Briefcase className="h-5 w-5 text-primary" />
                      {profile.services_completed}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Serviços prestados</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Avaliações recentes</h2>
                {reviews.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Ainda não há avaliações.</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((r) => (
                      <div key={r.id} className="border-b border-border last:border-0 pb-4 last:pb-0">
                        <div className="flex items-center gap-3 mb-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={r.reviewer_avatar_url ?? undefined} />
                            <AvatarFallback className="text-xs">{(r.reviewer_first_name ?? 'U').charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-foreground">{r.reviewer_first_name ?? 'Anônimo'}</div>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`h-3 w-3 ${i < r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
                              ))}
                              <span className="text-xs text-muted-foreground ml-1">{new Date(r.created_at).toLocaleDateString('pt-BR')}</span>
                            </div>
                          </div>
                        </div>
                        {r.comment && <p className="text-sm text-muted-foreground pl-11">{r.comment}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </motion.main>
    </div>
  );
};

export default PublicProfile;
