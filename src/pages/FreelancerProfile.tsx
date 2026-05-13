
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BadgeCheck } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Header from '@/components/Header';
import { useFreelancerProfile } from '@/hooks/useFreelancerProfile';
import { Skeleton } from '@/components/ui/skeleton';
import PageSEO from '@/components/common/PageSEO';
import StructuredData from '@/components/common/StructuredData';

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i: number = 0) => ({
    opacity: 1, scale: 1,
    transition: { duration: 0.4, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }
  })
};

const FreelancerProfile: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { freelancer, offers, loading } = useFreelancerProfile(id);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
          <Card className="rounded-2xl"><CardContent className="p-6"><div className="flex flex-col md:flex-row items-start gap-6"><Skeleton className="w-24 h-24 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></div></div></CardContent></Card>
          <Card className="rounded-2xl"><CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></CardContent></Card>
        </div>
      </div>
    );
  }

  if (!freelancer) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-muted-foreground">Perfil do freelancer não encontrado.</p>
          <Button variant="outline" onClick={() => navigate(-1)} className="mt-4 rounded-xl">Voltar</Button>
        </div>
      </div>
    );
  }

  const freelancerName = freelancer.first_name && freelancer.last_name ? `${freelancer.first_name} ${freelancer.last_name}` : 'Freelancer';

  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title={`${freelancerName} — Perfil de Freelancer`}
        description={`Conheça ${freelancerName}, freelancer na HelpAqui. Veja portfólio, serviços oferecidos e contrate com segurança profissionais qualificados perto de você.`}
        path={`/freelancer/${id}`}
        ogType="profile"
        ogImage={freelancer.avatar_url || undefined}
        noIndex
      />
      <StructuredData schema={{
        "@type": "Person",
        name: freelancerName,
        image: freelancer.avatar_url || undefined,
        url: `https://helpaquiapp.lovable.app/freelancer/${id}`,
        jobTitle: "Freelancer",
      }} />
      <Header />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="container mx-auto px-4 py-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center mb-4 text-foreground rounded-xl">
          <ArrowLeft className="h-4 w-4 mr-2" />Voltar
        </Button>
        <div className="max-w-4xl mx-auto space-y-6">
          <motion.div variants={scaleIn} initial="hidden" animate="visible" custom={0}>
            <Card className="rounded-2xl border-border/50 shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24 ring-4 ring-primary/10">
                      <AvatarImage src={freelancer.avatar_url} alt={freelancerName} />
                      <AvatarFallback className="text-2xl gradient-primary text-white">{freelancerName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {freelancer.verified && (
                      <div className="absolute -top-1 -left-1 bg-primary rounded-full p-1 border-2 border-background shadow-sm">
                        <BadgeCheck className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                      {freelancerName}
                      {freelancer.verified && <BadgeCheck className="h-5 w-5 text-primary" />}
                    </h1>
                    <p className="text-muted-foreground mt-2">Membro desde {new Date(freelancer.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={scaleIn} initial="hidden" animate="visible" custom={1}>
            <Card className="rounded-2xl border-border/50 shadow-sm">
              <CardHeader><CardTitle>Portfólio de Serviços</CardTitle></CardHeader>
              <CardContent>
                {offers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {offers.map((offer, i) => (
                      <motion.div key={offer.id} variants={scaleIn} initial="hidden" animate="visible" custom={i}>
                        <Card className="rounded-xl border-border/50 hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-base">{offer.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1 mb-3 line-clamp-3">{offer.description}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {offer.categories?.map((cat: string) => <Badge key={cat} variant="secondary">{cat}</Badge>)}
                              {offer.custom_categories?.map((cat: string) => <Badge key={cat} variant="outline">{cat}</Badge>)}
                            </div>
                            <p className="font-bold text-lg text-primary mt-3">{offer.rate}</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhum serviço no portfólio no momento.</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default FreelancerProfile;
