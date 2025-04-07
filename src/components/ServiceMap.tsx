
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Locate } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { mockProfessionals } from '@/data/mockData';
import { useToast } from '@/components/ui/use-toast';
import { Bike, Car, Wrench, Home, Computer, Pen, Camera, Music, Palette, ShoppingBag } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Mapbox token - em produção, isso deve ser armazenado em variáveis de ambiente
mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZWFwaSIsImEiOiJjbDg2aDR4dGUweGFhM3BudmNnamk3bGN5In0.9Qt3MyJRRGlWvpOhfPX-YA';

interface ServiceMapProps {
  selectedCategory: string | null;
}

interface Location {
  lat: number;
  lng: number;
  address: string;
}

const ServiceMap: React.FC<ServiceMapProps> = ({ selectedCategory }) => {
  const [radius, setRadius] = useState<number[]>([5]);
  const [mapReady, setMapReady] = useState(false);
  const [userLocation, setUserLocation] = useState<Location>({
    lat: -23.5505,
    lng: -46.6333,
    address: "São Paulo, SP"
  });
  const [isLocating, setIsLocating] = useState(false);
  const { toast } = useToast();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  
  // Inicializar o mapa quando o componente montar
  useEffect(() => {
    if (mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [userLocation.lng, userLocation.lat],
        zoom: 12
      });
      
      // Adicionar controles de navegação
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Marcar quando o mapa estiver pronto
      map.current.on('load', () => {
        setMapReady(true);
      });
      
      // Adicionar marcador do usuário
      const userMarker = new mapboxgl.Marker({ color: '#10B981' })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map.current);
      
      return () => {
        map.current?.remove();
        markersRef.current.forEach(marker => marker.remove());
      };
    }
  }, []);
  
  // Atualizar o mapa quando a localização do usuário mudar
  useEffect(() => {
    if (map.current && mapReady) {
      map.current.setCenter([userLocation.lng, userLocation.lat]);
      
      // Remover marcadores antigos
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      
      // Adicionar marcador do usuário
      const userMarker = new mapboxgl.Marker({ color: '#10B981' })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map.current);
      
      // Adicionar marcadores de profissionais
      const filteredPros = selectedCategory 
        ? mockProfessionals.filter(pro => pro.categories.includes(selectedCategory))
        : mockProfessionals;
        
      // Gerar posições aleatórias dentro do raio para os profissionais
      filteredPros.forEach((pro, index) => {
        // Gerar uma posição aleatória dentro do raio
        const randomDistance = Math.random() * radius[0];
        const randomAngle = Math.random() * 2 * Math.PI;
        
        // Converter para coordenadas (aproximação para distâncias curtas)
        const latRad = userLocation.lat * (Math.PI / 180);
        const kmPerDegLat = 111.32; // km por grau de latitude (aproximadamente constante)
        const kmPerDegLng = 111.32 * Math.cos(latRad); // km por grau de longitude (varia com a latitude)
        
        const latOffset = (randomDistance * Math.sin(randomAngle)) / kmPerDegLat;
        const lngOffset = (randomDistance * Math.cos(randomAngle)) / kmPerDegLng;
        
        const proLat = userLocation.lat + latOffset;
        const proLng = userLocation.lng + lngOffset;
        
        // Criar elemento personalizado para o marcador
        const el = document.createElement('div');
        el.className = 'bg-white rounded-full border-2 border-helpaqui-blue shadow-lg flex items-center justify-center w-8 h-8 transform hover:scale-110 transition-transform cursor-pointer';
        el.style.width = '32px';
        el.style.height = '32px';
        el.style.borderRadius = '50%';
        el.style.display = 'flex';
        el.style.justifyContent = 'center';
        el.style.alignItems = 'center';
        el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        
        // Adicionar ícone baseado na categoria
        const icon = getCategoryIcon([pro.categories[0]]);
        const iconElement = document.createElement('div');
        iconElement.style.display = 'flex';
        iconElement.style.justifyContent = 'center';
        iconElement.style.alignItems = 'center';
        
        // Converter o componente React para HTML
        iconElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-${pro.categories[0]}"><circle cx="12" cy="12" r="10"/></svg>`;
        el.appendChild(iconElement);
        
        // Criar popup com informações do profissional
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div class="p-2 max-w-[200px]">
              <p class="font-bold text-sm">${pro.name}</p>
              <p class="text-xs">${pro.categories.join(", ")}</p>
              <p class="text-green-600 text-xs">Distância: ${pro.distance}</p>
              <div class="flex items-center mt-1">
                <div class="text-yellow-500 flex text-xs">
                  ${"★".repeat(Math.floor(pro.rating))}
                  ${"☆".repeat(5 - Math.floor(pro.rating))}
                </div>
                <span class="ml-1 text-gray-600 text-xs">(${pro.ratingCount})</span>
              </div>
            </div>
          `);
        
        // Adicionar marcador ao mapa
        const marker = new mapboxgl.Marker(el)
          .setLngLat([proLng, proLat])
          .setPopup(popup)
          .addTo(map.current!);
        
        markersRef.current.push(marker);
      });
    }
  }, [userLocation, radius, selectedCategory, mapReady]);
  
  // Solicitar localização ao montar o componente
  useEffect(() => {
    // Verificamos se o navegador suporta geolocalização
    if ("geolocation" in navigator) {
      // Pergunte automaticamente quando o componente montar
      handleGetCurrentLocation();
    }
  }, []);
  
  // Filtragem de profissionais por categoria
  const filteredProfessionals = selectedCategory 
    ? mockProfessionals.filter(pro => pro.categories.includes(selectedCategory))
    : mockProfessionals;

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Erro",
        description: "Seu navegador não suporta geolocalização",
        variant: "destructive"
      });
      return;
    }

    setIsLocating(true);
    console.info("Buscando localização atual...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Atualiza a localização do usuário
        setUserLocation({
          lat: latitude,
          lng: longitude,
          address: "Localização atual" // Idealmente, usaríamos um serviço de geocodificação reversa aqui
        });

        toast({
          title: "Localização obtida",
          description: "Sua localização atual foi encontrada com sucesso!",
        });
        setIsLocating(false);
      },
      (error) => {
        let errorMessage = "Erro ao obter sua localização";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permissão de localização negada pelo usuário";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Informações de localização indisponíveis";
            break;
          case error.TIMEOUT:
            errorMessage = "Tempo esgotado ao buscar localização";
            break;
        }
        
        toast({
          title: "Erro de localização",
          description: errorMessage,
          variant: "destructive"
        });
        setIsLocating(false);
      },
      { 
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Função para obter ícone com base na categoria
  const getCategoryIcon = (categories: string[]) => {
    // Priorizamos a categoria selecionada se estiver presente
    const primaryCategory = selectedCategory && categories.includes(selectedCategory) 
      ? selectedCategory 
      : categories[0];
      
    switch (primaryCategory) {
      case 'delivery':
        return <Bike className="text-red-500" />;
      case 'transporte':
        return <Car className="text-blue-500" />;
      case 'reparos':
        return <Wrench className="text-yellow-500" />;
      case 'domesticos':
        return <Home className="text-green-500" />;
      case 'tecnologia':
        return <Computer className="text-purple-500" />;
      case 'escrita':
        return <Pen className="text-indigo-500" />;
      case 'fotografia':
        return <Camera className="text-pink-500" />;
      case 'musica':
        return <Music className="text-teal-500" />;
      case 'design':
        return <Palette className="text-orange-500" />;
      case 'compras':
        return <ShoppingBag className="text-amber-500" />;
      default:
        return <MapPin className="text-helpaqui-blue" />;
    }
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md">
      {/* Configuração do mapa */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Profissionais próximos</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4 text-helpaqui-blue" />
            <span>{userLocation.address}</span>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-700">Raio de busca: {radius[0]} km</span>
            <Button
              variant="outline"
              size="sm"
              className="text-xs flex items-center gap-1"
              onClick={handleGetCurrentLocation}
              disabled={isLocating}
            >
              <Locate className={`h-3 w-3 ${isLocating ? "animate-spin" : ""}`} />
              {isLocating ? "Localizando..." : "Localização atual"}
            </Button>
          </div>
          <Slider
            value={radius}
            min={1}
            max={20}
            step={1}
            className="my-4"
            onValueChange={setRadius}
          />
        </div>
      </div>
      
      {/* Área do mapa */}
      <div className="relative bg-gray-200 h-[300px] w-full">
        {!mapReady ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-helpaqui-blue mx-auto mb-2"></div>
            <p className="text-gray-600">Carregando mapa...</p>
          </div>
        ) : null}
        <div ref={mapContainer} className="absolute inset-0" />
      </div>
    </div>
  );
};

export default ServiceMap;
