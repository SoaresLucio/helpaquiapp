
import React from 'react';
import { serviceCategories } from '@/data/mockData';
import { 
  Sparkles, 
  Construction, 
  Wrench, 
  Bike, 
  Briefcase, 
  MoreHorizontal 
} from 'lucide-react';

// Mapeamento de ícones para cada categoria
const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'cleaning':
      return <Sparkles className="h-6 w-6" />;
    case 'construction':
      return <Construction className="h-6 w-6" />;
    case 'repairs':
      return <Wrench className="h-6 w-6" />;
    case 'delivery':
      return <Bike className="h-6 w-6" />;
    case 'office':
      return <Briefcase className="h-6 w-6" />;
    case 'others':
      return <MoreHorizontal className="h-6 w-6" />;
    default:
      return <Sparkles className="h-6 w-6" />;
  }
};

interface CategorySelectorProps {
  onSelectCategory: (categoryId: string) => void;
  selectedCategory: string | null;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  onSelectCategory,
  selectedCategory
}) => {
  return (
    <div className="py-4">
      <h2 className="text-lg font-semibold mb-3">Categorias de Serviços</h2>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {serviceCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all ${
              selectedCategory === category.id
                ? 'bg-helpaqui-blue text-white shadow-md'
                : 'bg-white border border-gray-200 hover:border-helpaqui-blue'
            }`}
          >
            <div className={`mb-2 ${
              selectedCategory === category.id ? 'text-white' : 'text-helpaqui-blue'
            }`}>
              {getCategoryIcon(category.icon)}
            </div>
            <span className="text-sm text-center">{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategorySelector;
