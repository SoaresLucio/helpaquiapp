
import React from 'react';
import { Shield, MessageCircle, Calendar, Star, MapPin, Clock, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Professional } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';
import ProfessionalAvatar from '@/components/professional/ProfessionalAvatar';
import ProfessionalPortfolio from '@/components/professional/ProfessionalPortfolio';

interface ProfessionalCardProps {
  professional: Professional;
}

const ProfessionalCard: React.FC<ProfessionalCardProps> = ({ professional }) => {
  const navigate = useNavigate();
  
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

  const handleHire = () => {
    // Implementar lógica de contratação direta
    navigate('/chat', { state: { 
      freelancerId: professional.id.split('/')[0],
      offerType: 'hire',
      serviceTitle: professional.description 
    }});
  };

  const categoryNames = professional.categories?.join(', ') || '';

  return (
    <div className="helpaqui-card p-6 mb-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start">
        <ProfessionalAvatar
          avatar={professional.avatar}
          name={professional.name}
          available={professional.available}
          isVerified={isVerified}
        />
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-xl">{professional.name}</h3>
              {isVerified && (
                <BadgeCheck className="h-5 w-5 text-blue-500" title="Perfil Verificado" />
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
          
          <p className="text-sm text-helpaqui-blue font-medium mb-2">{categoryNames}</p>
          
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <MapPin className="h-4 w-4 mr-1 text-helpaqui-blue" />
            <span>{professional.distance}</span>
            
            <span className="mx-2">•</span>
            
            <Clock className="h-4 w-4 mr-1 text-gray-400" />
            <span>{professional.available ? 'Disponível agora' : 'Indisponível'}</span>
            
            <span className="mx-2">•</span>
            
            <span>Responde em {responseTime}</span>
          </div>
          
          <p className="text-sm text-gray-700 mb-4 leading-relaxed">{professional.description}</p>
          
          {/* Informações adicionais sobre o serviço */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Taxa de resposta:</span>
                <span className="ml-2 font-medium text-green-600">{responseRate}%</span>
              </div>
              <div>
                <span className="text-gray-600">Tempo médio:</span>
                <span className="ml-2 font-medium">{responseTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* HELPAQUI Garantia */}
      <div className="flex items-center mb-3 bg-green-50 rounded-lg px-4 py-2">
        <Shield className="h-4 w-4 text-green-600 mr-2" />
        <span className="text-sm text-green-800">
          HELPAQUI Garantia: Cobertura para reparos em até 7 dias
        </span>
      </div>
      
      {/* Privacy Notice */}
      <div className="flex items-center mb-4 bg-blue-50 rounded-lg px-4 py-2">
        <Shield className="h-4 w-4 text-blue-600 mr-2" />
        <span className="text-sm text-blue-800">
          Contato seguro: Informações compartilhadas apenas após confirmação
        </span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="font-bold text-lg text-helpaqui-green">{professional.price}</span>
          {professional.available && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              Disponível
            </span>
          )}
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleViewProfile}>
            Ver perfil
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleContact}
            className="flex items-center space-x-1"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Conversar</span>
          </Button>
          <Button 
            size="sm" 
            className="helpaqui-button-primary flex items-center space-x-1" 
            onClick={handleHire}
          >
            <Calendar className="h-4 w-4" />
            <span>Contratar</span>
          </Button>
        </div>
      </div>
      
      <ProfessionalPortfolio portfolio={professional.portfolio || []} />
    </div>
  );
};

export default ProfessionalCard;
