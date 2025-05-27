
import React, { useState } from 'react';
import { MapPin, Star, Filter, Clock, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProfessionalCard from '@/components/ProfessionalCard';
import ServiceMap from '@/components/ServiceMap';
import { mockProfessionals, serviceCategories } from '@/data/mockData';

interface SolicitanteHomeProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const SolicitanteHome: React.FC<SolicitanteHomeProps> = ({ selectedCategory, onSelectCategory }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [filterRating, setFilterRating] = useState('all');

  // Filtrar freelancers por categoria, pesquisa e rating
  const filteredProfessionals = mockProfessionals.filter(pro => {
    const matchesCategory = !selectedCategory || pro.categories.includes(selectedCategory);
    const matchesSearch = !searchTerm || 
      pro.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pro.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = filterRating === 'all' || 
      (filterRating === '4+' && pro.rating >= 4) ||
      (filterRating === '4.5+' && pro.rating >= 4.5);
    
    return matchesCategory && matchesSearch && matchesRating;
  });

  // Ordenar freelancers
  const sortedProfessionals = [...filteredProfessionals].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'distance':
        return parseFloat(a.distance) - parseFloat(b.distance);
      case 'price':
        return parseFloat(a.price.replace(/[^\d,]/g, '').replace(',', '.')) - 
               parseFloat(b.price.replace(/[^\d,]/g, '').replace(',', '.'));
      default:
        return 0;
    }
  });

  const selectedCategoryName = selectedCategory 
    ? serviceCategories.find(cat => cat.id === selectedCategory)?.name 
    : null;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Bem-vindo ao HelpAqui! 👋
        </h1>
        <p className="text-gray-600 mb-4">
          Encontre freelancers qualificados próximos a você
        </p>
        
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Pesquisar freelancers ou serviços..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Melhor avaliação</SelectItem>
              <SelectItem value="distance">Mais próximo</SelectItem>
              <SelectItem value="price">Menor preço</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterRating} onValueChange={setFilterRating}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filtrar por nota" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as notas</SelectItem>
              <SelectItem value="4+">4+ estrelas</SelectItem>
              <SelectItem value="4.5+">4.5+ estrelas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Service Map */}
      <ServiceMap selectedCategory={selectedCategory} />

      {/* Freelancers List */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {selectedCategoryName 
              ? `Freelancers de ${selectedCategoryName}` 
              : 'Freelancers Recomendados'}
          </h2>
          
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <MapPin className="h-4 w-4" />
            <span>{sortedProfessionals.length} profissionais encontrados</span>
          </div>
        </div>
        
        {sortedProfessionals.length > 0 ? (
          <div className="space-y-4">
            {sortedProfessionals.map(professional => (
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
              Nenhum freelancer encontrado com os filtros aplicados.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                onSelectCategory(null);
                setSearchTerm('');
                setFilterRating('all');
              }}
            >
              Limpar filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SolicitanteHome;
