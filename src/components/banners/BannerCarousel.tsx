
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import PromotionalBanner from './PromotionalBanner';

interface Banner {
  id: string;
  title: string;
  image_url: string;
  link_url?: string;
  cta_text?: string;
  display_order: number;
}

interface BannerCarouselProps {
  banners: Banner[];
  className?: string;
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({ banners, className = '' }) => {
  const [api, setApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  // Sync currentIndex with Embla's selected index
  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrentIndex(api.selectedScrollSnap());
    };

    api.on('select', onSelect);
    onSelect();

    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  // Auto-rotation using Embla API
  useEffect(() => {
    if (!api || banners.length <= 1) return;

    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [api, banners.length]);

  const handleBannerClick = useCallback((banner: Banner) => {
    if (banner.link_url) {
      // If link_url is an internal route (starts with /), navigate internally
      if (banner.link_url.startsWith('/')) {
        navigate(banner.link_url);
      } else {
        window.open(banner.link_url, '_blank', 'noopener,noreferrer');
      }
    } else {
      // Navigate to dedicated banner detail page
      navigate(`/banner/${banner.id}`);
    }
  }, [navigate]);

  const handleDotClick = useCallback((index: number) => {
    api?.scrollTo(index);
  }, [api]);

  if (banners.length === 0) return null;

  if (banners.length === 1) {
    const banner = banners[0];
    return (
      <PromotionalBanner
        title={banner.title}
        imageUrl={banner.image_url}
        ctaText={banner.cta_text || undefined}
        onClick={() => handleBannerClick(banner)}
        className={`h-[300px] md:h-[400px] ${className}`}
      />
    );
  }

  return (
    <div className={className}>
      <Carousel className="w-full" setApi={setApi} opts={{ loop: true }}>
        <CarouselContent>
          {banners.map((banner) => (
            <CarouselItem key={banner.id}>
              <PromotionalBanner
                title={banner.title}
                imageUrl={banner.image_url}
                ctaText={banner.cta_text || undefined}
                onClick={() => handleBannerClick(banner)}
                className="h-[300px] md:h-[400px]"
              />
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>

      {/* Pagination dots */}
      {banners.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-primary scale-125 shadow-md'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              onClick={() => handleDotClick(index)}
              aria-label={`Ir para banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerCarousel;
