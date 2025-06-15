
import { useMemo } from 'react';
import { serviceCategories, Professional } from '@/data/mockData';

interface UseFilteringProps {
  professionals: Professional[];
  selectedCategory: string | null;
  searchTerm: string;
  filterRating: string;
  sortBy: string;
}

export const useProfessionalFiltering = ({
  professionals,
  selectedCategory,
  searchTerm,
  filterRating,
  sortBy
}: UseFilteringProps) => {
  const filteredAndSortedProfessionals = useMemo(() => {
    // Filter professionals
    const filtered = professionals.filter(pro => {
      const matchesCategory = !selectedCategory || pro.categories.includes(selectedCategory);
      const matchesSearch = !searchTerm || 
        pro.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pro.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRating = filterRating === 'all' || 
        (filterRating === '4+' && pro.rating >= 4) ||
        (filterRating === '4.5+' && pro.rating >= 4.5);
      
      return matchesCategory && matchesSearch && matchesRating;
    });

    // Sort professionals
    const sorted = [...filtered].sort((a, b) => {
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

    return sorted;
  }, [professionals, selectedCategory, searchTerm, filterRating, sortBy]);

  const selectedCategoryName = selectedCategory 
    ? serviceCategories.find(cat => cat.id === selectedCategory)?.name 
    : null;

  return {
    filteredProfessionals: filteredAndSortedProfessionals,
    selectedCategoryName
  };
};
