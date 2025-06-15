
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Star, Users, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import FreelancerCard from '../freelancers/FreelancerCard';
import { useFreelancersForHome } from '@/hooks/useFreelancersForHome';

interface SolicitanteHomeProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const SolicitanteHome: React.FC<SolicitanteHomeProps> = ({ 
  selectedCategory, 
  onSelectCategory 
}) => {
  const navigate = useNavigate();
  
  const { 
    data: freelancers = [], 
    isLoading, 
    error 
  } = useFreelancersForHome(3);

  // Filtrar por categoria se selecionada
  const filteredFreelancers = selectedCategory 
    ? freelancers.filter(freelancer => freelancer.category === selectedCategory)
    : freelancers;

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
          </div>
        </Card>
      )}

      {/* Lista de profissionais */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-helpaqui-blue mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando profissionais...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-red-600">Erro ao carregar profissionais. Tente novamente.</p>
            </CardContent>
          </Card>
        ) : filteredFreelancers.length > 0 ? (
          <>
            <div className="space-y-4">
              {filteredFreelancers.map((freelancer) => (
                <FreelancerCard 
                  key={freelancer.id} 
                  freelancer={freelancer} 
                />
              ))}
            </div>
            
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
          </>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium mb-2">Nenhum profissional encontrado</h3>
              <p className="text-gray-600 mb-4">
                {selectedCategory 
                  ? `Não há profissionais disponíveis na categoria ${selectedCategory} no momento.`
                  : 'Não há profissionais disponíveis no momento.'
                }
              </p>
              <Button 
                variant="outline" 
                onClick={() => onSelectCategory(null)}
              >
                {selectedCategory ? 'Ver todas as categorias' : 'Atualizar'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SolicitanteHome;
