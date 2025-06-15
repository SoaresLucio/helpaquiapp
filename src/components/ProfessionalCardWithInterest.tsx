
import React from 'react';
import { Star, MapPin, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Professional } from '@/data/mockData';
import ShowInterestDialog from '@/components/solicitante/ShowInterestDialog';

interface ProfessionalCardWithInterestProps {
  professional: Professional;
}

const ProfessionalCardWithInterest: React.FC<ProfessionalCardWithInterestProps> = ({ 
  professional 
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        <img
          src={professional.avatar}
          alt={professional.name}
          className="w-16 h-16 rounded-full object-cover"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {professional.name}
              </h3>
              {professional.isVerified && (
                <Shield className="h-4 w-4 text-blue-500" />
              )}
            </div>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium text-gray-900">
                {professional.rating.toFixed(1)}
              </span>
              <span className="text-sm text-gray-500">
                ({professional.ratingCount})
              </span>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {professional.description}
          </p>
          
          <div className="flex flex-wrap gap-1 mb-3">
            {professional.categories.slice(0, 3).map((category, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {category}
              </Badge>
            ))}
            {professional.categories.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{professional.categories.length - 3}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {professional.distance}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {professional.responseTime}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-lg font-semibold text-helpaqui-green">
                {professional.price}
              </span>
              <ShowInterestDialog 
                offerId={professional.id}
                freelancerName={professional.name}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalCardWithInterest;
