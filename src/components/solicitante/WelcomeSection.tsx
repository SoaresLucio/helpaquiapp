
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface WelcomeSectionProps {
  userName: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  filterRating: string;
  onFilterRatingChange: (value: string) => void;
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({
  userName,
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  filterRating,
  onFilterRatingChange
}) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Bem-vindo ao HelpAqui, {userName}! 👋
      </h1>
      <p className="text-gray-600 mb-4">
        Encontre freelancers qualificados próximos a você
      </p>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Pesquisar freelancers ou serviços..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Melhor avaliação</SelectItem>
            <SelectItem value="distance">Mais próximo</SelectItem>
            <SelectItem value="price">Menor preço</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filterRating} onValueChange={onFilterRatingChange}>
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
  );
};

export default WelcomeSection;
