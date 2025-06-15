
import React from 'react';
import { Star, MapPin, Clock, BadgeCheck, Shield, MessageCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { FreelancerProfile } from '@/types/freelancer';

interface FreelancerCardProps {
  freelancer: FreelancerProfile;
}

const FreelancerCard: React.FC<FreelancerCardProps> = ({ freelancer }) => {
  const navigate = useNavigate();
  
  const freelancerName = freelancer.user_profile?.first_name && freelancer.user_profile?.last_name
    ? `${freelancer.user_profile.first_name} ${freelancer.user_profile.last_name}`
    : 'Freelancer';

  const handleContact = () => {
    navigate('/chat');
  };

  const handleViewProfile = () => {
    navigate(`/freelancer/${freelancer.id}`);
  };

  const formatPrice = (price: number) => {
    return `R$ ${(price / 100).toFixed(2)}/hora`;
  };

  const portfolioPhotos = Array.isArray(freelancer.portfolio_photos) 
    ? freelancer.portfolio_photos 
    : [];

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <Avatar className="w-16 h-16 border-2 border-white shadow">
              <AvatarImage 
                src={freelancer.user_profile?.avatar_url || '/placeholder.svg'} 
                alt={freelancerName}
              />
              <AvatarFallback>
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
              freelancer.available ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
            
            {freelancer.user_profile?.verified && (
              <div className="absolute top-0 left-0 bg-blue-500 rounded-full p-1 border-2 border-white">
                <BadgeCheck className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
          
          {/* Informações principais */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{freelancerName}</h3>
                {freelancer.user_profile?.verified && (
                  <BadgeCheck className="h-4 w-4 text-blue-500" />
                )}
              </div>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
                <span className="text-sm font-medium">4.8</span>
                <span className="text-xs text-gray-500 ml-1">(32)</span>
              </div>
            </div>
            
            <Badge variant="secondary" className="mb-2">
              {freelancer.category}
            </Badge>
            
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <Clock className="h-4 w-4 mr-1 text-gray-400" />
              <span>{freelancer.available ? 'Disponível agora' : 'Indisponível'}</span>
            </div>
            
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {freelancer.description || 'Profissional qualificado e experiente.'}
            </p>
            
            {/* Garantia HELPAQUI */}
            <div className="flex items-center mb-3 bg-green-50 rounded px-3 py-1.5">
              <Shield className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-xs text-green-800">
                HELPAQUI Garantia: Cobertura para reparos em até 7 dias
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium text-helpaqui-blue">
                {freelancer.hourly_rate ? formatPrice(freelancer.hourly_rate) : 'A combinar'}
              </span>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleViewProfile}>
                  Ver perfil
                </Button>
                <Button size="sm" className="helpaqui-button-primary" onClick={handleContact}>
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Contatar
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Portfólio */}
        {portfolioPhotos.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium mb-2">Portfólio</p>
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {portfolioPhotos.slice(0, 4).map((photo: any, index: number) => (
                <div key={index} className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden">
                  <img 
                    src={typeof photo === 'string' ? photo : photo.url || '/placeholder.svg'} 
                    alt={`Trabalho ${index + 1}`}
                    className="w-full h-full object-cover" 
                  />
                </div>
              ))}
              {portfolioPhotos.length > 4 && (
                <div className="w-16 h-16 flex-shrink-0 rounded-md bg-gray-200 flex items-center justify-center">
                  <span className="text-xs text-gray-500">+{portfolioPhotos.length - 4}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Observações */}
        {freelancer.observations && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-gray-500">
              <strong>Observações:</strong> {freelancer.observations}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FreelancerCard;
