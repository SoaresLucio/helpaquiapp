
import React from 'react';

interface ProfessionalPortfolioProps {
  portfolio: string[];
}

const ProfessionalPortfolio: React.FC<ProfessionalPortfolioProps> = ({ portfolio }) => {
  if (!portfolio || portfolio.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 pt-3 border-t">
      <p className="text-sm font-medium mb-2">Portfólio</p>
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {portfolio.map((image, index) => (
          <div key={index} className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden">
            <img 
              src={image} 
              alt={`Trabalho ${index + 1}`}
              className="w-full h-full object-cover" 
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfessionalPortfolio;
