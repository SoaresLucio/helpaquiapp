
import React from 'react';
import { MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProfessionalCard from '@/components/ProfessionalCard';
import { Professional } from '@/data/mockData';

interface OffersSectionProps {
  selectedCategoryName: string | null;
  professionals: Professional[];
  loading: boolean;
  onReload: () => void;
}

const OffersSection: React.FC<OffersSectionProps> = ({
  selectedCategoryName,
  professionals,
  loading,
  onReload
}) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          {selectedCategoryName 
            ? `Freelancers de ${selectedCategoryName}` 
            : 'Ofertas de Help Disponíveis'}
        </h2>
        
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <MapPin className="h-4 w-4" />
          <span>
            {loading ? 'Carregando...' : `${professionals.length} ofertas encontradas`}
          </span>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-12 w-12 mx-auto animate-spin" />
          </div>
          <p className="text-gray-500">Carregando ofertas de freelancers...</p>
        </div>
      ) : professionals.length > 0 ? (
        <div className="space-y-4">
          {professionals.map(professional => (
            <ProfessionalCard 
              key={professional.id} 
              professional={professional}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-gray-500 mb-4">
            Nenhuma oferta de Help encontrada.
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              console.log('🔄 Recarregando ofertas manualmente...');
              onReload();
            }}
          >
            Recarregar ofertas
          </Button>
        </div>
      )}
    </div>
  );
};

export default OffersSection;
