
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import BackButton from '@/components/ui/back-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMyOffers } from '@/hooks/useMyOffers';
import { useOfferInterests } from '@/hooks/useOfferInterests';

const MyOffers: React.FC = () => {
  const navigate = useNavigate();
  const { user, userType } = useAuth();
  const { offers, loading, deleteOffer } = useMyOffers();

  // Redirect if not freelancer
  if (userType !== 'freelancer') {
    navigate('/');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-helpaqui-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando suas ofertas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <BackButton to="/" label="Voltar ao Início" />
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Minhas Ofertas de Ajuda</h1>
            <p className="text-gray-600">Gerencie todas as suas ofertas de serviço</p>
          </div>
          
          <Button 
            onClick={() => navigate('/')}
            className="bg-helpaqui-green hover:bg-helpaqui-green/90"
          >
            Nova Oferta
          </Button>
        </div>

        {offers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma oferta criada
              </h3>
              <p className="text-gray-500 mb-4">
                Você ainda não criou nenhuma oferta de ajuda.
              </p>
              <Button 
                onClick={() => navigate('/')}
                className="bg-helpaqui-green hover:bg-helpaqui-green/90"
              >
                Criar Primeira Oferta
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => (
              <OfferCard 
                key={offer.id} 
                offer={offer} 
                onDelete={deleteOffer}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface OfferCardProps {
  offer: any;
  onDelete: (offerId: string) => Promise<void>;
}

const OfferCard: React.FC<OfferCardProps> = ({ offer, onDelete }) => {
  const { interests, loading } = useOfferInterests(offer.id);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir esta oferta?')) {
      setIsDeleting(true);
      try {
        await onDelete(offer.id);
      } catch (error) {
        console.error('Erro ao excluir oferta:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{offer.title}</CardTitle>
            <p className="text-gray-600 mt-1">{offer.description}</p>
            
            <div className="flex flex-wrap gap-2 mt-3">
              {offer.categories?.map((category: string, index: number) => (
                <Badge key={index} variant="secondary">
                  {category}
                </Badge>
              ))}
              {offer.custom_categories?.map((category: string, index: number) => (
                <Badge key={`custom-${index}`} variant="outline">
                  {category}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Eye className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Taxa: {offer.rate}
            </span>
          </div>
          
          {offer.location && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                📍 {offer.location}
              </span>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-helpaqui-green" />
            <span className="text-sm font-medium text-helpaqui-green">
              {loading ? 'Carregando...' : `${interests.length} interessado(s)`}
            </span>
          </div>
        </div>
        
        {interests.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Solicitantes Interessados:
            </h4>
            <div className="space-y-2">
              {interests.slice(0, 3).map((interest: any) => (
                <div key={interest.id} className="text-sm text-gray-600">
                  • Interesse demonstrado em {new Date(interest.created_at).toLocaleDateString()}
                  {interest.message && (
                    <span className="block ml-2 text-xs text-gray-500">
                      "{interest.message}"
                    </span>
                  )}
                </div>
              ))}
              {interests.length > 3 && (
                <p className="text-xs text-gray-500">
                  +{interests.length - 3} interessado(s) a mais
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MyOffers;
