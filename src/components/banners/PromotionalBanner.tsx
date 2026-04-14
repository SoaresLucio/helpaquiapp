import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface PromotionalBannerProps {
  title: string;
  imageUrl: string;
  linkUrl?: string;
  ctaText?: string;
  className?: string;
  onClick?: () => void;
}

const PromotionalBanner: React.FC<PromotionalBannerProps> = ({
  title,
  imageUrl,
  ctaText,
  className = '',
  onClick,
}) => {
  return (
    <div
      className={`relative rounded-xl overflow-hidden shadow-lg cursor-pointer group ${className}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
      aria-label={title}
    >
      <div
        className="w-full h-full bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
        style={{ backgroundImage: `url(${imageUrl})`, minHeight: '300px' }}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex items-end justify-between">
        <h3 className="text-white text-lg md:text-2xl font-bold drop-shadow-lg max-w-[70%]">
          {title}
        </h3>

        {ctaText && (
          <Button
            variant="secondary"
            size="lg"
            onClick={(e) => { e.stopPropagation(); onClick?.(); }}
            className="bg-white/90 hover:bg-white text-foreground font-semibold shadow-lg shrink-0"
          >
            {ctaText}
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default PromotionalBanner;
