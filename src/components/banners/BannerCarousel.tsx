
import React, { useState, useEffect } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
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
  const [currentIndex, setCurrentIndex] = useState(0);

  // Debug log para verificar banners recebidos
  useEffect(() => {
    console.log('BannerCarousel received banners:', banners);
  }, [banners]);

  // Auto-rotation para múltiplos banners
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000); // Trocar a cada 5 segundos

    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) {
    console.log('No banners to display');
    return null;
  }

  // Se há apenas um banner, renderizar diretamente
  if (banners.length === 1) {
    const banner = banners[0];
    console.log('Rendering single banner:', banner);
    return (
      <PromotionalBanner
        title={banner.title}
        imageUrl={banner.image_url}
        linkUrl={banner.link_url || undefined}
        ctaText={banner.cta_text || undefined}
        className={`h-[300px] md:h-[400px] ${className}`}
      />
    );
  }

  console.log('Rendering multiple banners carousel');
  return (
    <div className={className}>
      <Carousel className="w-full">
        <CarouselContent>
          {banners.map((banner, index) => (
            <CarouselItem key={banner.id}>
              <PromotionalBanner
                title={banner.title}
                imageUrl={banner.image_url}
                linkUrl={banner.link_url || undefined}
                ctaText={banner.cta_text || undefined}
                className="h-[300px] md:h-[400px]"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {banners.length > 1 && (
          <>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </>
        )}
      </Carousel>
      
      {/* Indicadores de paginação */}
      {banners.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-helpaqui-blue' : 'bg-gray-300'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerCarousel;
