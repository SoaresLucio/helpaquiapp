
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { serviceCategories } from '@/data/mockData';

interface CategorySelectorProps {
  categories: string[];
  customCategory: string;
  addingCustom: boolean;
  onToggleCategory: (categoryId: string) => void;
  onCustomCategoryChange: (value: string) => void;
  onAddCustomCategory: () => void;
  onSetAddingCustom: (adding: boolean) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  customCategory,
  addingCustom,
  onToggleCategory,
  onCustomCategoryChange,
  onAddCustomCategory,
  onSetAddingCustom
}) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        Categorias <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-2 gap-2 mb-2">
        {serviceCategories.map((cat) => (
          <div key={cat.id} className="flex items-center space-x-2">
            <Checkbox 
              id={`category-${cat.id}`}
              checked={categories.includes(cat.id)}
              onCheckedChange={() => onToggleCategory(cat.id)}
            />
            <Label htmlFor={`category-${cat.id}`}>{cat.name}</Label>
          </div>
        ))}
      </div>
      
      {addingCustom ? (
        <div className="flex space-x-2 mt-2">
          <Input
            value={customCategory}
            onChange={(e) => onCustomCategoryChange(e.target.value)}
            placeholder="Digite nova categoria"
            className="flex-1"
          />
          <Button 
            type="button" 
            onClick={onAddCustomCategory} 
            variant="outline"
          >
            Adicionar
          </Button>
          <Button 
            type="button" 
            onClick={() => onSetAddingCustom(false)} 
            variant="ghost"
          >
            Cancelar
          </Button>
        </div>
      ) : (
        <Button 
          type="button" 
          onClick={() => onSetAddingCustom(true)} 
          variant="outline" 
          className="mt-2 w-full"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" /> Adicionar Categoria Personalizada
        </Button>
      )}
      
      {categories.length > 0 && categories.some(cat => !serviceCategories.some(c => c.id === cat)) && (
        <div className="mt-2">
          <p className="text-sm font-medium mb-1">Categorias personalizadas:</p>
          <div className="flex flex-wrap gap-1">
            {categories
              .filter(cat => !serviceCategories.some(c => c.id === cat))
              .map(cat => (
                <div key={cat} className="bg-gray-100 px-2 py-1 rounded-md text-xs flex items-center">
                  {cat}
                  <button 
                    type="button" 
                    onClick={() => onToggleCategory(cat)} 
                    className="ml-1 text-gray-500 hover:text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;
