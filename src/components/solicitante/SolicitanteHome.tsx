
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Star, Users, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import ProfessionalCard from '../ProfessionalCard';
import { mockProfessionals } from '@/data/mockData';

interface SolicitanteHomeProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const SolicitanteHome: React.FC<SolicitanteHomeProps> = ({ 
  selectedCategory, 
  onSelectCategory 
}) => {
  const navigate = useNavigate();

  const filteredProfessionals = selectedCategory 
    ? mockProfessionals.filter(prof => prof.categories.includes(selectedCategory))
    : mockProfessionals.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header com ação rápida */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Encontre o profissional ideal</h2>
              <p className="text-gray-600">
                {selectedCategory 
                  ? `Profissionais de ${selectedCategory} próximos a você`
                  : 'Profissionais qualificados prontos para ajudar'
                }
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => navigate('/recommended-freelancers')}
                className="helpaqui-button-primary"
              >
                <Users className="h-4 w-4 mr-2" />
                Ver Todos os Freelancers
              </Button>
              <Button variant="outline">
                <PlusCircle className="h-4 w-4 mr-2" />
                Solicitar Serviço
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros rápidos */}
      {selectedCategory && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Categoria selecionada:</span>
                <Badge variant="default">{selectedCategory}</Badge>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onSelectCategory(null)}
              >
                Limpar filtro
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de profissionais */}
      <div className="space-y-4">
        {filteredProfessionals.length > 0 ? (
          <>
            {filteredProfessionals.map((professional) => (
              <ProfessionalCard 
                key={professional.id} 
                professional={professional} 
              />
            ))}
            
            {!selectedCategory && (
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Veja mais profissionais</h3>
                  <p className="text-gray-600 mb-4">
                    Encontre o freelancer perfeito para o seu projeto
                  </p>
                  <Button 
                    onClick={() => navigate('/recommended-freelancers')}
                    className="helpaqui-button-primary"
                  >
                    Ver Todos os Freelancers
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium mb-2">Nenhum profissional encontrado</h3>
              <p className="text-gray-600 mb-4">
                Não há profissionais disponíveis nesta categoria no momento.
              </p>
              <Button 
                variant="outline" 
                onClick={() => onSelectCategory(null)}
              >
                Ver todas as categorias
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SolicitanteHome;
