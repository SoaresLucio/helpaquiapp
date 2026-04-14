
import React from 'react';
import { Search, MapPin } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';

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
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100"
    >
      {/* Barra de acento no topo */}
      <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #6c2ea0, #2b439b)' }} />

      <div className="px-5 pt-5 pb-4">
        {/* Header com saudação */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-slate-500 text-sm">Bem-vindo de volta, {userName} 👋</p>
            <h1 className="text-xl font-black text-slate-900 mt-0.5">
              O que você precisa hoje?
            </h1>
          </div>
          {/* Ícone de localização */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #6c2ea0, #2b439b)' }}
          >
            <MapPin className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 mb-4 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
          <Search className="h-4 w-4 shrink-0" style={{ color: '#6c2ea0' }} />
          <input
            type="text"
            placeholder="Ex: eletricista, pintor, encanador..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-transparent text-slate-800 placeholder:text-slate-400 text-sm outline-none flex-1"
          />
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-700 rounded-xl h-9 text-xs focus:ring-purple-200">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Melhor avaliação</SelectItem>
              <SelectItem value="distance">Mais próximo</SelectItem>
              <SelectItem value="price">Menor preço</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterRating} onValueChange={onFilterRatingChange}>
            <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-700 rounded-xl h-9 text-xs focus:ring-purple-200">
              <SelectValue placeholder="Filtrar por nota" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as notas</SelectItem>
              <SelectItem value="4+">4+ estrelas</SelectItem>
              <SelectItem value="4.5+">4.5+ estrelas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* CTA */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full py-3.5 rounded-2xl text-white font-bold text-sm shadow-md transition-all"
          style={{
            background: 'linear-gradient(135deg, #6c2ea0, #2b439b)',
            boxShadow: '0 4px 15px rgba(108,46,160,0.25)',
          }}
        >
          + Solicitar Serviço
        </motion.button>
      </div>
    </motion.section>
  );
};

export default WelcomeSection;
