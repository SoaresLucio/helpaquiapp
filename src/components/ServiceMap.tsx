
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
  const [watchId, setWatchId] = useState<number | null>(null);
  const { toast } = useToast();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  
  // Inicializar o mapa quando o componente montar
  useEffect(() => {
    if (mapContainer.current && !map.current) {
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
        console.log('Mapa carregado com sucesso');
      });
      
      map.current.on('error', (e) => {
        console.error('Erro no mapa:', e);
        toast({
          title: "Erro no mapa",
          description: "Falha ao carregar o mapa. Verifique sua conexão.",
          variant: "destructive"
        });
      });
    }
    
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
      map.current?.remove();
      markersRef.current.forEach(marker => marker.remove());
    };
  }, []);
  
  // Função para atualizar localização em tempo real
  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Erro",
        description: "Seu navegador não suporta geolocalização",
        variant: "destructive"
      });
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('Nova localização:', latitude, longitude);
        
        setUserLocation({
          lat: latitude,
          lng: longitude,
          address: "Localização atual"
        });
        
        // Atualizar marcador do usuário em tempo real
        if (map.current && mapReady) {
          if (userMarkerRef.current) {
            userMarkerRef.current.setLngLat([longitude, latitude]);
          } else {
            userMarkerRef.current = new mapboxgl.Marker({ 
              color: '#10B981',
              scale: 1.2
            })
              .setLngLat([longitude, latitude])
              .addTo(map.current);
          }
          
          // Centralizar mapa na nova localização
          map.current.easeTo({
            center: [longitude, latitude],
            duration: 1000
          });
        }
      },
      (error) => {
        console.error('Erro de geolocalização:', error);
        let errorMessage = "Erro ao obter sua localização";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permissão de localização negada";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Localização indisponível";
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
      },
      { 
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000 // Cache por 30 segundos
      }
    );
    
    setWatchId(id);
  };
  
  // Atualizar o mapa quando a categoria ou localização mudar
  useEffect(() => {
    if (map.current && mapReady) {
      // Remover marcadores antigos (exceto o do usuário)
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      
      // Adicionar/atualizar marcador do usuário
      if (!userMarkerRef.current) {
        userMarkerRef.current = new mapboxgl.Marker({ 
          color: '#10B981',
          scale: 1.2
        })
          .setLngLat([userLocation.lng, userLocation.lat])
          .addTo(map.current);
      } else {
        userMarkerRef.current.setLngLat([userLocation.lng, userLocation.lat]);
      }
      
      // Filtrar profissionais por categoria
      const filteredPros = selectedCategory 
        ? mockProfessionals.filter(pro => pro.categories.includes(selectedCategory))
        : mockProfessionals;
        
      // Adicionar marcadores de profissionais e trabalhos disponíveis
      filteredPros.forEach((pro, index) => {
        // Gerar uma posição aleatória dentro do raio
        const randomDistance = Math.random() * radius[0];
        const randomAngle = Math.random() * 2 * Math.PI;
        
        // Converter para coordenadas
        const latRad = userLocation.lat * (Math.PI / 180);
        const kmPerDegLat = 111.32;
        const kmPerDegLng = 111.32 * Math.cos(latRad);
        
        const latOffset = (randomDistance * Math.sin(randomAngle)) / kmPerDegLat;
        const lngOffset = (randomDistance * Math.cos(randomAngle)) / kmPerDegLng;
        
        const proLat = userLocation.lat + latOffset;
        const proLng = userLocation.lng + lngOffset;
        
        // Criar elemento personalizado para o marcador
        const el = document.createElement('div');
        el.className = 'bg-white rounded-full border-2 border-helpaqui-blue shadow-lg flex items-center justify-center w-10 h-10 transform hover:scale-110 transition-transform cursor-pointer';
        el.style.background = 'white';
        el.style.borderRadius = '50%';
        el.style.border = '2px solid #2563eb';
        el.style.width = '40px';
        el.style.height = '40px';
        el.style.display = 'flex';
        el.style.justifyContent = 'center';
        el.style.alignItems = 'center';
        el.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
        el.style.zIndex = '10';
        
        // Adicionar ícone baseado na categoria
        const iconSvg = getCategoryIconSvg(pro.categories[0]);
        el.innerHTML = iconSvg;
        
        // Criar popup com informações do profissional
        const popup = new mapboxgl.Popup({ 
          offset: 25,
          className: 'custom-popup'
        })
          .setHTML(`
            <div class="p-3 max-w-[250px] bg-white rounded-lg shadow-lg">
              <p class="font-bold text-base text-gray-800">${pro.name}</p>
              <p class="text-sm text-gray-600 mb-2">${pro.categories.join(", ")}</p>
              <p class="text-green-600 text-sm font-medium">📍 ${pro.distance}</p>
              <div class="flex items-center mt-2">
                <div class="text-yellow-500 flex text-sm">
                  ${"★".repeat(Math.floor(pro.rating))}
                  ${"☆".repeat(5 - Math.floor(pro.rating))}
                </div>
                <span class="ml-2 text-gray-600 text-sm">(${pro.ratingCount})</span>
              </div>
              <div class="mt-2 text-xs text-gray-500">
                💼 Trabalho disponível
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
      
      console.log(`Adicionados ${filteredPros.length} marcadores ao mapa`);
    }
  }, [userLocation, radius, selectedCategory, mapReady]);
  
  // Solicitar localização ao montar o componente
  useEffect(() => {
    if ("geolocation" in navigator) {
      handleGetCurrentLocation();
      startLocationTracking(); // Iniciar rastreamento em tempo real
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
    console.log("Buscando localização atual...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        setUserLocation({
          lat: latitude,
          lng: longitude,
          address: "Localização atual"
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

  // Função para obter ícone SVG com base na categoria
  const getCategoryIconSvg = (category: string) => {
    const iconColor = getCategoryColor(category);
    
    switch (category) {
      case 'delivery':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="${iconColor}"><path d="M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9zm0 16a7 7 0 1 1 7-7 7 7 0 0 1-7 7z"/><path d="M12 7v5l3 2"/></svg>`;
      case 'transporte':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="${iconColor}"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18.4 10c-.4-.8-1.2-1.3-2.1-1.3H16V7a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v2H6.7c-.9 0-1.7.5-2.1 1.3L2.5 11.1C1.7 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2a3 3 0 0 0 6 0h4a3 3 0 0 0 6 0zM7 18.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm10 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/></svg>`;
      case 'reparos':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="${iconColor}"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>`;
      case 'domesticos':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="${iconColor}"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>`;
      case 'tecnologia':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="${iconColor}"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>`;
      default:
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="${iconColor}"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'delivery': return '#ef4444';
      case 'transporte': return '#3b82f6';
      case 'reparos': return '#eab308';
      case 'domesticos': return '#22c55e';
      case 'tecnologia': return '#8b5cf6';
      default: return '#2563eb';
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
              {isLocating ? "Localizando..." : "Atualizar localização"}
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
        
        <div className="text-xs text-gray-500">
          📍 Localização em tempo real ativa • {filteredProfessionals.length} trabalhos disponíveis
        </div>
      </div>
      
      {/* Área do mapa */}
      <div className="relative bg-gray-200 h-[300px] w-full">
        {!mapReady ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-helpaqui-blue mb-2"></div>
            <p className="text-gray-600">Carregando mapa...</p>
          </div>
        ) : null}
        <div ref={mapContainer} className="absolute inset-0" />
      </div>
    </div>
  );
};

export default ServiceMap;
