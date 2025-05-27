
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Locate } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { mockProfessionals } from '@/data/mockData';
import { useToast } from '@/components/ui/use-toast';
import { Wrapper, Status } from '@googlemaps/react-wrapper';

// Declare global google types
declare global {
  interface Window {
    google: typeof google;
  }
}

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
  const [userLocation, setUserLocation] = useState<Location>({
    lat: -23.5505,
    lng: -46.6333,
    address: "São Paulo, SP"
  });
  const [isLocating, setIsLocating] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const { toast } = useToast();
  
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

  // Função para atualizar localização em tempo real
  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({
          lat: latitude,
          lng: longitude,
          address: "Localização atual"
        });
      },
      (error) => {
        console.error('Erro de geolocalização:', error);
      },
      { 
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
    
    setWatchId(id);
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      handleGetCurrentLocation();
      startLocationTracking();
    }
    
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const render = (status: Status) => {
    if (status === Status.LOADING) return <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-helpaqui-blue mb-2"></div>;
    if (status === Status.FAILURE) return <div>Erro ao carregar mapa</div>;
    return <GoogleMapComponent userLocation={userLocation} filteredProfessionals={filteredProfessionals} radius={radius[0]} />;
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
        <Wrapper apiKey="AIzaSyBpWI8pUwTvmUOhQ3UvXO6WBnEJ_Qz_wQs" render={render}>
          <GoogleMapComponent userLocation={userLocation} filteredProfessionals={filteredProfessionals} radius={radius[0]} />
        </Wrapper>
      </div>
    </div>
  );
};

interface GoogleMapComponentProps {
  userLocation: Location;
  filteredProfessionals: any[];
  radius: number;
}

const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({ userLocation, filteredProfessionals, radius }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  useEffect(() => {
    if (ref.current && !map && window.google) {
      const newMap = new window.google.maps.Map(ref.current, {
        center: { lat: userLocation.lat, lng: userLocation.lng },
        zoom: 12,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "on" }]
          }
        ]
      });
      setMap(newMap);
    }
  }, [ref, map, userLocation]);

  useEffect(() => {
    if (map && window.google) {
      // Limpar marcadores existentes
      markers.forEach(marker => marker.setMap(null));
      setMarkers([]);

      // Adicionar marcador do usuário
      const userMarker = new window.google.maps.Marker({
        position: { lat: userLocation.lat, lng: userLocation.lng },
        map: map,
        title: "Sua localização",
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="15" fill="#10B981" stroke="white" stroke-width="3"/>
              <circle cx="20" cy="20" r="5" fill="white"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(40, 40)
        }
      });

      const newMarkers = [userMarker];

      // Adicionar marcadores dos profissionais
      filteredProfessionals.forEach((pro, index) => {
        const randomDistance = Math.random() * radius;
        const randomAngle = Math.random() * 2 * Math.PI;
        
        const latRad = userLocation.lat * (Math.PI / 180);
        const kmPerDegLat = 111.32;
        const kmPerDegLng = 111.32 * Math.cos(latRad);
        
        const latOffset = (randomDistance * Math.sin(randomAngle)) / kmPerDegLat;
        const lngOffset = (randomDistance * Math.cos(randomAngle)) / kmPerDegLng;
        
        const proLat = userLocation.lat + latOffset;
        const proLng = userLocation.lng + lngOffset;

        const marker = new window.google.maps.Marker({
          position: { lat: proLat, lng: proLng },
          map: map,
          title: pro.name,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="15" fill="#2563eb" stroke="white" stroke-width="3"/>
                <text x="20" y="25" text-anchor="middle" fill="white" font-size="12">💼</text>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(40, 40)
          }
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; max-width: 250px;">
              <h3 style="margin: 0 0 8px 0; font-weight: bold;">${pro.name}</h3>
              <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${pro.categories.join(", ")}</p>
              <p style="margin: 0 0 8px 0; color: #10b981; font-size: 14px;">📍 ${pro.distance}</p>
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <span style="color: #fbbf24;">★★★★★</span>
                <span style="margin-left: 8px; color: #666; font-size: 14px;">(${pro.ratingCount})</span>
              </div>
              <div style="font-size: 12px; color: #666;">💼 Trabalho disponível</div>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        newMarkers.push(marker);
      });

      setMarkers(newMarkers);
      
      // Centralizar mapa na localização do usuário
      map.setCenter({ lat: userLocation.lat, lng: userLocation.lng });
    }
  }, [map, userLocation, filteredProfessionals, radius]);

  return <div ref={ref} style={{ width: '100%', height: '100%' }} />;
};

export default ServiceMap;
