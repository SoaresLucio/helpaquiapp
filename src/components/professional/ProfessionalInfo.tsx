
import React from 'react';
import { Star, MapPin, Clock, BadgeCheck } from 'lucide-react';
import { serviceCategories } from '@/data/mockData';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import ResponseTimeIndicator from '@/components/ResponseTimeIndicator';

interface ProfessionalInfoProps {
  name: string;
  categories: string[];
  rating: number;
  ratingCount: number;
  distance: string;
  available: boolean;
  isVerified: boolean;
  description: string;
  responseTime: string;
  responseRate: number;
}

const ProfessionalInfo: React.FC<ProfessionalInfoProps> = ({
  name,
  categories,
  rating,
  ratingCount,
  distance,
  available,
  isVerified,
  description,
  responseTime,
  responseRate
}) => {
  const categoryNames = categories.map(
    catId => serviceCategories.find(cat => cat.id === catId)?.name || catId
  ).join(', ');

  return (
    <div className="flex-1">
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-1">
          <h3 className="font-semibold text-lg">{name}</h3>
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
          {ratingCount > 0 ? (
            <>
              <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
              <span className="text-sm font-medium">{rating.toFixed(1)}</span>
              <span className="text-xs text-gray-500 ml-1">({ratingCount})</span>
            </>
          ) : (
            <span className="text-xs text-gray-500">Sem avaliações</span>
          )}
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-1">{categoryNames}</p>
      
      <div className="flex items-center text-sm text-gray-500 mb-2">
        <MapPin className="h-4 w-4 mr-1 text-helpaqui-blue" />
        <span>{distance}</span>
        
        <span className="mx-2">•</span>
        
        <Clock className="h-4 w-4 mr-1 text-gray-400" />
        <span>{available ? 'Disponível agora' : 'Indisponível'}</span>
      </div>
      
      {/* Response Time */}
      <div className="mb-2">
        <ResponseTimeIndicator 
          averageTime={responseTime}
          responseRate={responseRate}
        />
      </div>
      
      <p className="text-sm mb-3">{description}</p>
    </div>
  );
};

export default ProfessionalInfo;
