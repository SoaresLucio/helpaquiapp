
import React from 'react';
import Header from '@/components/Header';
import CategorySelector from '@/components/CategorySelector';

interface IndexHeaderProps {
  userType: 'solicitante' | 'freelancer' | 'empresa' | null;
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const IndexHeader: React.FC<IndexHeaderProps> = ({
  userType,
  selectedCategory,
  onSelectCategory
}) => {
  return (
    <>
      <Header />
      
      {/* Category Selector - Only for Solicitantes */}
      {userType === 'solicitante' && (
        <div className="helpaqui-container py-4">
          <CategorySelector 
            onSelectCategory={onSelectCategory} 
            selectedCategory={selectedCategory} 
          />
        </div>
      )}
    </>
  );
};

export default IndexHeader;
