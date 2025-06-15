
import React from 'react';
import { Star, MapPin, Calendar, Clock, BadgeCheck, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Professional, serviceCategories } from '@/data/mockData';
import ResponseTimeIndicator from './ResponseTimeIndicator';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { useNavigate } from 'react-router-dom';

interface ProfessionalCardProps {
  professional: Professional;
}

const ProfessionalCard: React.FC<ProfessionalCardProps> = ({ professional }) => {
  const navigate = useNavigate();
  
  const categoryNames = professional.categories.map(
    catId => serviceCategories.find(cat => cat.id === catId)?.name || catId
  ).join(', ');

  const isVerified = professional.isVerified || false;
  const responseTime = professional.responseTime || "1h";
  const responseRate = professional.responseRate || 95;

  const handleViewProfile = () => {
    const freelancerId = professional.id.split('/')[0];
    navigate(`/freelancer/${freelancerId}`);
  };

  const handleContact = () => {
    navigate('/chat');
  };

  return (
    <div className="helpaqui-card p-4 mb-4">
      <div className="flex items-start">
        {/* Avatar */}
        <div className="relative mr-3 flex-shrink-0">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow">
            <img 
              src={professional.avatar} 
              alt={professional.name}
              className="w-full h-full object-cover" 
            />
          </div>
          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
            professional.available ? 'bg-green-500' : 'bg-gray-400'
          }`}></div>
          
          {isVerified && (
            <div className="absolute top-0 left-0 bg-blue-500 rounded-full p-1 border-2 border-white">
              <BadgeCheck className="h-3 w-3 text-white" />
            </div>
          )}
        </div>
        
        {/* Informações */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center gap-1">
              <h3 className="font-semibold text-lg">{professional.name}</h3>
              {isVerified && (
                <HoverCard>
                  <HoverCardTrigger>
                    <BadgeCheck className="h-4 w-4 text-blue-500 cursor-help" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-64 p-3">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm flex items-center gap-1">
                        <BadgeCheck className="h-4 w-4 text-blue-500" />
                        Perfil Verificado
                      </h4>
                      <p className="text-xs text-gray-500">
                        Este profissional passou por nossa verificação de identidade e documentos, confirmando sua credibilidade.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              )}
            </div>
            <div className="flex items-center">
              {professional.ratingCount > 0 ? (
                <>
                  <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
                  <span className="text-sm font-medium">{professional.rating.toFixed(1)}</span>
                  <span className="text-xs text-gray-500 ml-1">({professional.ratingCount})</span>
                </>
              ) : (
                <span className="text-xs text-gray-500">Sem avaliações</span>
              )}
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-1">{categoryNames}</p>
          
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <MapPin className="h-4 w-4 mr-1 text-helpaqui-blue" />
            <span>{professional.distance}</span>
            
            <span className="mx-2">•</span>
            
            <Clock className="h-4 w-4 mr-1 text-gray-400" />
            <span>{professional.available ? 'Disponível agora' : 'Indisponível'}</span>
          </div>
          
          {/* Response Time */}
          <div className="mb-2">
            <ResponseTimeIndicator 
              averageTime={responseTime}
              responseRate={responseRate}
            />
          </div>
          
          <p className="text-sm mb-3">{professional.description}</p>
          
          {/* HELPAQUI Garantia */}
          <div className="flex items-center mb-3 bg-green-50 rounded px-3 py-1.5">
            <Shield className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-xs text-green-800">
              HELPAQUI Garantia: Cobertura para reparos em até 7 dias
            </span>
          </div>
          
          {/* Privacy Notice */}
          <div className="flex items-center mb-3 bg-blue-50 rounded px-3 py-1.5">
            <Shield className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-xs text-blue-800">
              Contato seguro: Informações pessoais compartilhadas apenas após confirmação de serviço
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium text-helpaqui-blue">{professional.price}</span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleViewProfile}>
                Ver perfil
              </Button>
              <Button size="sm" className="helpaqui-button-primary" onClick={handleContact}>
                Contatar
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Portfólio (se houver) */}
      {professional.portfolio && professional.portfolio.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-sm font-medium mb-2">Portfólio</p>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {professional.portfolio.map((image, index) => (
              <div key={index} className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden">
                <img 
                  src={image} 
                  alt={`Trabalho ${index + 1}`}
                  className="w-full h-full object-cover" 
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalCard;
