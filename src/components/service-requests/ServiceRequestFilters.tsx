
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ServiceRequestFiltersProps {
  selectedCategory: string;
  selectedUrgency: string;
  onCategoryChange: (category: string) => void;
  onUrgencyChange: (urgency: string) => void;
}

const ServiceRequestFilters: React.FC<ServiceRequestFiltersProps> = ({
  selectedCategory,
  selectedUrgency,
  onCategoryChange,
  onUrgencyChange
}) => {
  const [categories, setCategories] = useState<Array<{id: string, nome: string}>>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('id, nome')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const clearFilters = () => {
    onCategoryChange('');
    onUrgencyChange('');
  };

  const hasFilters = selectedCategory || selectedUrgency;

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtros:</span>
          </div>

          <div className="flex-1 flex gap-4 flex-wrap">
            <div className="min-w-[200px]">
              <Select value={selectedCategory} onValueChange={onCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.nome}>
                      {category.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-[200px]">
              <Select value={selectedUrgency} onValueChange={onUrgencyChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as urgências" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as urgências</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {hasFilters && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearFilters}
              className="flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Limpar filtros
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceRequestFilters;
