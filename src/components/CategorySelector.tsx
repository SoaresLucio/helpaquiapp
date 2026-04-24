
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

const iconMap = {
  cleaning: Sparkles,
  construction: Construction,
  repairs: Wrench,
  delivery: Bike,
  office: Briefcase,
  others: MoreHorizontal
} as const;

interface CategorySelectorProps {
  onSelectCategory: (categoryId: string) => void;
  selectedCategory: string | null;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  onSelectCategory,
  selectedCategory
}) => {
  const getCategoryIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || Sparkles;
    return <IconComponent className="h-6 w-6" />;
  };

  return (
    <div className="py-4">
      <h2 className="text-lg font-semibold mb-3">Categorias de Serviços</h2>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {serviceCategories.map((category) => {
          const isSelected = selectedCategory === category.id;
          
          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all ${
                isSelected
                  ? 'bg-helpaqui-purple text-white shadow-md'
                  : 'bg-white border border-gray-200 hover:border-helpaqui-purple'
              }`}
            >
              <div className={`mb-2 ${isSelected ? 'text-white' : 'text-helpaqui-purple'}`}>
                {getCategoryIcon(category.icon)}
              </div>
              <span className="text-sm text-center">{category.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategorySelector;
