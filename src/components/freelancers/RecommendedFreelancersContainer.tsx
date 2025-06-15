
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Users, Filter } from 'lucide-react';
import FreelancerCard from './FreelancerCard';
import { fetchRecommendedFreelancers } from '@/services/freelancersService';

const RecommendedFreelancersContainer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rating');

  const { 
    data: freelancers = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['recommended-freelancers', categoryFilter, sortBy],
    queryFn: () => fetchRecommendedFreelancers({ category: categoryFilter, sortBy }),
    refetchInterval: 30 * 1000, // Refetch a cada 30 segundos para mostrar novas ofertas
  });

  const filteredFreelancers = freelancers.filter(freelancer =>
    freelancer.user_profile?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    freelancer.user_profile?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    freelancer.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    freelancer.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-helpaqui-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-red-600">Erro ao carregar freelancers. Tente novamente.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Freelancers Recomendados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar freelancers..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                <SelectItem value="limpeza">Limpeza</SelectItem>
                <SelectItem value="eletrica">Elétrica</SelectItem>
                <SelectItem value="hidraulica">Hidráulica</SelectItem>
                <SelectItem value="pintura">Pintura</SelectItem>
                <SelectItem value="jardinagem">Jardinagem</SelectItem>
                <SelectItem value="marcenaria">Marcenaria</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Avaliação</SelectItem>
                <SelectItem value="price_low">Menor preço</SelectItem>
                <SelectItem value="price_high">Maior preço</SelectItem>
                <SelectItem value="recent">Mais recentes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredFreelancers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || categoryFilter !== 'all' 
                  ? 'Nenhum freelancer encontrado com os filtros selecionados.'
                  : 'Nenhum freelancer disponível no momento. Novos profissionais aparecem aqui automaticamente quando oferecem seus serviços!'
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredFreelancers.map((freelancer) => (
                <FreelancerCard key={freelancer.id} freelancer={freelancer} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RecommendedFreelancersContainer;
