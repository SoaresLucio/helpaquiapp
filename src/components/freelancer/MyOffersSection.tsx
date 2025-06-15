
import React, { useState } from 'react';
import { Edit, Trash2, Users, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useOfferInterests } from '@/hooks/useOfferInterests';

interface FreelancerOffer {
  id: string;
  title: string;
  description: string;
  categories: string[];
  custom_categories: string[] | null;
  rate: string;
  location: string | null;
  is_active: boolean;
  created_at: string;
}

interface MyOffersSectionProps {
  offers: FreelancerOffer[];
  onReload: () => void;
}

const MyOffersSection: React.FC<MyOffersSectionProps> = ({ offers, onReload }) => {
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const { interests, loading: interestsLoading } = useOfferInterests(selectedOfferId);
  const { toast } = useToast();

  const handleToggleActive = async (offerId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('freelancer_service_offers')
        .update({ is_active: !currentStatus })
        .eq('id', offerId);

      if (error) {
        console.error('Erro ao atualizar oferta:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a oferta.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Oferta atualizada",
        description: `Oferta ${!currentStatus ? 'ativada' : 'desativada'} com sucesso.`
      });

      onReload();
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta oferta?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('freelancer_service_offers')
        .delete()
        .eq('id', offerId);

      if (error) {
        console.error('Erro ao excluir oferta:', error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir a oferta.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Oferta excluída",
        description: "Oferta excluída com sucesso."
      });

      onReload();
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    }
  };

  if (offers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Minhas Ofertas de Help</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            Você ainda não tem ofertas publicadas.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Minhas Ofertas de Help</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {offers.map((offer) => {
              const allCategories = [...offer.categories, ...(offer.custom_categories || [])];
              
              return (
                <div key={offer.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold">{offer.title}</h3>
                        <Badge variant={offer.is_active ? "default" : "secondary"}>
                          {offer.is_active ? "Ativa" : "Inativa"}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{offer.description}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {allCategories.map((category, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Valor: <strong className="text-helpaqui-green">{offer.rate}</strong></span>
                        {offer.location && <span>Local: {offer.location}</span>}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOfferId(selectedOfferId === offer.id ? null : offer.id)}
                      >
                        <Users className="h-4 w-4 mr-1" />
                        Interessados
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(offer.id, offer.is_active)}
                      >
                        {offer.is_active ? (
                          <EyeOff className="h-4 w-4 mr-1" />
                        ) : (
                          <Eye className="h-4 w-4 mr-1" />
                        )}
                        {offer.is_active ? 'Desativar' : 'Ativar'}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteOffer(offer.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                  
                  {selectedOfferId === offer.id && (
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-medium mb-3">Solicitantes Interessados</h4>
                      {interestsLoading ? (
                        <p className="text-gray-500">Carregando...</p>
                      ) : interests.length > 0 ? (
                        <div className="space-y-3">
                          {interests.map((interest) => (
                            <div key={interest.id} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <img
                                    src={interest.profiles?.avatar_url || '/placeholder.svg'}
                                    alt="Avatar"
                                    className="w-8 h-8 rounded-full"
                                  />
                                  <div>
                                    <p className="font-medium text-sm">
                                      {interest.profiles?.first_name && interest.profiles?.last_name
                                        ? `${interest.profiles.first_name} ${interest.profiles.last_name}`
                                        : 'Solicitante'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {new Date(interest.created_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <Badge variant={
                                  interest.status === 'accepted' ? 'default' : 
                                  interest.status === 'rejected' ? 'destructive' : 'secondary'
                                }>
                                  {interest.status === 'pending' ? 'Pendente' :
                                   interest.status === 'accepted' ? 'Aceito' : 'Rejeitado'}
                                </Badge>
                              </div>
                              {interest.message && (
                                <p className="text-sm text-gray-600 mt-2">{interest.message}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">Nenhum interesse ainda.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyOffersSection;
