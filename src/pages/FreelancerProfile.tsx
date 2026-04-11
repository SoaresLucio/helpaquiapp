
import React from 'react';
import { ArrowLeft, BadgeCheck } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Header from '@/components/Header';
import { useFreelancerProfile } from '@/hooks/useFreelancerProfile';
import { Skeleton } from '@/components/ui/skeleton';

const FreelancerProfile: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { freelancer, offers, loading } = useFreelancerProfile(id);

  if (loading) {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="helpaqui-container py-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row items-start gap-6">
                                <Skeleton className="w-24 h-24 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-8 w-48" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                           <Skeleton className="h-6 w-1/3" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
  }

  if (!freelancer) {
      return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="helpaqui-container py-6 text-center">
                <p>Perfil do freelancer não encontrado.</p>
                <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">
                    Voltar
                </Button>
            </div>
        </div>
      );
  }
  
  const freelancerName = freelancer.first_name && freelancer.last_name ? `${freelancer.first_name} ${freelancer.last_name}` : 'Freelancer';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="helpaqui-container py-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center mb-4 text-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        
        <div className="max-w-4xl mx-auto">
          {/* Header do Perfil */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={freelancer.avatar_url} alt={freelancerName} />
                    <AvatarFallback>{freelancerName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {freelancer.verified && (
                    <div className="absolute top-0 left-0 bg-blue-500 rounded-full p-1 border-2 border-white">
                      <BadgeCheck className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h1 className="text-2xl font-bold flex items-center gap-2">
                    {freelancerName}
                    {freelancer.verified && <BadgeCheck className="h-5 w-5 text-blue-500" />}
                  </h1>
                   <p className="text-gray-600 dark:text-gray-300 mt-2">
                    Membro desde {new Date(freelancer.created_at).toLocaleDateString('pt-BR')}
                   </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Portfólio de Serviços */}
          <Card>
            <CardHeader>
              <CardTitle>Portfólio de Serviços</CardTitle>
            </CardHeader>
            <CardContent>
              {offers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {offers.map((offer) => (
                    <Card key={offer.id}>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-base">{offer.title}</h3>
                        <p className="text-sm text-gray-600 mt-1 mb-3 line-clamp-3">{offer.description}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {offer.categories?.map((cat: string) => <Badge key={cat} variant="secondary">{cat}</Badge>)}
                            {offer.custom_categories?.map((cat: string) => <Badge key={cat} variant="outline">{cat}</Badge>)}
                        </div>
                        <p className="font-bold text-lg text-helpaqui-purple mt-3">{offer.rate}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p>Nenhum serviço no portfólio no momento.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default FreelancerProfile;
