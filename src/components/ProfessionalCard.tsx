
import React from 'react';
import { Star, MapPin, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Professional, serviceCategories } from '@/data/mockData';

interface ProfessionalCardProps {
  professional: Professional;
}

const ProfessionalCard: React.FC<ProfessionalCardProps> = ({ professional }) => {
  const categoryNames = professional.categories.map(
    catId => serviceCategories.find(cat => cat.id === catId)?.name || ''
  ).join(', ');

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
        </div>
        
        {/* Informações */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-semibold text-lg">{professional.name}</h3>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
              <span className="text-sm font-medium">{professional.rating}</span>
              <span className="text-xs text-gray-500 ml-1">({professional.ratingCount})</span>
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
          
          <p className="text-sm mb-3">{professional.description}</p>
          
          <div className="flex items-center justify-between">
            <span className="font-medium text-helpaqui-blue">{professional.price}</span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">Ver perfil</Button>
              <Button size="sm" className="helpaqui-button-primary">Contatar</Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Portfólio (se houver) */}
      {professional.portfolio.length > 0 && (
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
