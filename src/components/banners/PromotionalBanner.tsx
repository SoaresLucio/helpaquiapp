
import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface PromotionalBannerProps {
  title: string;
  imageUrl: string;
  linkUrl?: string;
  ctaText?: string;
  className?: string;
}

const PromotionalBanner: React.FC<PromotionalBannerProps> = ({
  title,
  imageUrl,
  linkUrl,
  ctaText,
  className = ''
}) => {
  const handleClick = () => {
    if (linkUrl) {
      window.open(linkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  console.log('PromotionalBanner rendering:', { title, imageUrl, linkUrl, ctaText });

  return (
    <div className={`relative rounded-xl overflow-hidden shadow-lg ${className}`}>
      <div 
        className="w-full h-full bg-cover bg-center bg-no-repeat cursor-pointer"
        style={{ 
          backgroundImage: `url(${imageUrl})`,
          minHeight: '300px'
        }}
        onClick={linkUrl ? handleClick : undefined}
      >
        {/* Overlay para melhor legibilidade */}
        <div className="absolute inset-0 bg-black bg-opacity-30" />
        
        {/* Conteúdo do banner */}
        <div className="relative h-full flex items-center justify-between p-6 md:p-8 min-h-[300px]">
          <div className="flex-1">
            <h2 className="text-white text-2xl md:text-3xl font-bold mb-2 drop-shadow-lg">
              {title}
            </h2>
          </div>
          
          {ctaText && linkUrl && (
            <div className="ml-4">
              <Button 
                variant="secondary"
                size="lg"
                onClick={handleClick}
                className="bg-white/90 hover:bg-white text-gray-900 font-semibold shadow-lg"
              >
                {ctaText}
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromotionalBanner;
