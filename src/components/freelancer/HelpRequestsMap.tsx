import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Locate, Filter } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { config } from '@/config/environment';
import { supabase } from '@/integrations/supabase/client';
import { serviceCategories } from '@/data/mockData';

declare global {
  interface Window {
    google: typeof google;
  }
}

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface ServiceRequestLocation {
  id: string;
  title: string;
  description: string | null;
  category: string;
  location_address: string | null;
  budget_min: number | null;
  budget_max: number | null;
  client_name: string;
  created_at: string;
  lat: number;
  lng: number;
}

interface HelpRequestsMapProps {
  onRequestSelect?: (requestId: string) => void;
}

const HelpRequestsMap: React.FC<HelpRequestsMapProps> = ({ onRequestSelect }) => {
  const [radius, setRadius] = useState<number[]>([10]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [userLocation, setUserLocation] = useState<Location>({
    lat: -23.5505,
    lng: -46.6333,
    address: "São Paulo, SP"
  });
  const [isLocating, setIsLocating] = useState(false);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequestLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchServiceRequests();
  }, [selectedCategory]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      handleGetCurrentLocation();
    }
  }, []);

  const fetchServiceRequests = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('service_requests')
        .select(`
          id,
          title,
          description,
          category,
          location_address,
          budget_min,
          budget_max,
          created_at,
          location_lat,
          location_lng
        `)
        .eq('status', 'open')
        .not('location_lat', 'is', null)
        .not('location_lng', 'is', null);

      if (selectedCategory && selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data: requestsData, error } = await query;

      if (error) {
        console.error('Error fetching service requests:', error);
        return;
      }

      // For now, we'll generate mock coordinates since we don't have real location data
      // In a real app, you would geocode the addresses or store coordinates
      const requestsWithLocations: ServiceRequestLocation[] = (requestsData || []).map(request => ({
        ...request,
        client_name: 'Cliente', // In real app, join with profiles table
        lat: request.location_lat || userLocation.lat + (Math.random() - 0.5) * 0.1,
        lng: request.location_lng || userLocation.lng + (Math.random() - 0.5) * 0.1
      }));

      setServiceRequests(requestsWithLocations);
    } catch (error) {
      console.error('Error fetching service requests:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const filteredRequests = serviceRequests.filter(request => {
    // Filter by distance from user location
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      request.lat,
      request.lng
    );
    return distance <= radius[0];
  });

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return 'A combinar';
    if (min && max && min !== max) return `R$ ${min} - R$ ${max}`;
    if (min) return `R$ ${min}`;
    if (max) return `R$ ${max}`;
    return 'A combinar';
  };

  const render = (status: Status) => {
    if (status === Status.LOADING) return <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-helpaqui-purple mb-2"></div>;
    if (status === Status.FAILURE) return <div>Erro ao carregar mapa</div>;
    return <GoogleMapComponent userLocation={userLocation} serviceRequests={filteredRequests} onRequestSelect={onRequestSelect} />;
  };

  // Async wrapper component to handle Google Maps API key loading
  const AsyncWrapper = ({ render }: { render: (status: Status) => React.ReactElement }) => {
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [keyLoading, setKeyLoading] = useState(true);

    useEffect(() => {
      const loadApiKey = async () => {
        try {
          const key = await config.googleMaps.getApiKey();
          setApiKey(key);
        } catch (error) {
          console.error('Failed to load Google Maps API key:', error);
          setApiKey('YOUR_GOOGLE_MAPS_API_KEY_HERE');
        } finally {
          setKeyLoading(false);
        }
      };

      loadApiKey();
    }, []);

    if (keyLoading || !apiKey) {
      return <div className="h-96 flex items-center justify-center">Carregando configuração do mapa...</div>;
    }

    if (apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
      return (
        <div className="h-96 flex items-center justify-center text-red-500">
          ⚠️ Google Maps API key não configurada. Configure nas configurações do projeto.
        </div>
      );
    }

    return <Wrapper apiKey={apiKey} render={render} />;
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md">
      {/* Map Configuration */}
      <div className="p-4 bg-gray-50 border-b space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Solicitações de Help no Mapa</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4 text-helpaqui-purple" />
            <span>{userLocation.address}</span>
          </div>
        </div>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Categoria:</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {serviceCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium">Raio de busca: {radius[0]} km</label>
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
              max={50}
              step={1}
              className="my-2"
              onValueChange={setRadius}
            />
          </div>
        </div>
        
        <div className="text-xs text-gray-500">
          📍 {filteredRequests.length} solicitações encontradas no raio de {radius[0]}km
        </div>
      </div>
      
      {/* Map Area */}
      <div className="relative bg-gray-200 h-[400px] w-full">
        <AsyncWrapper 
          render={render}
        />
      </div>
    </div>
  );
};

interface GoogleMapComponentProps {
  userLocation: Location;
  serviceRequests: ServiceRequestLocation[];
  onRequestSelect?: (requestId: string) => void;
}

const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({ 
  userLocation, 
  serviceRequests, 
  onRequestSelect 
}) => {
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
      // Clear existing markers
      markers.forEach(marker => marker.setMap(null));
      setMarkers([]);

      // Add user location marker
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

      // Add service request markers
      serviceRequests.forEach((request) => {
        const marker = new window.google.maps.Marker({
          position: { lat: request.lat, lng: request.lng },
          map: map,
          title: request.title,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="15" fill="#ef4444" stroke="white" stroke-width="3"/>
                <text x="20" y="25" text-anchor="middle" fill="white" font-size="12">🆘</text>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(40, 40)
          }
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; max-width: 300px;">
              <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">${request.title}</h3>
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px; line-height: 1.4;">${request.description || 'Sem descrição'}</p>
              <div style="margin-bottom: 8px;">
                <span style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px; font-size: 12px; color: #374151;">${request.category}</span>
              </div>
              <p style="margin: 0 0 8px 0; color: #10b981; font-size: 14px; font-weight: 600;">💰 ${formatBudget(request.budget_min, request.budget_max)}</p>
              <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 12px;">📍 ${request.location_address || 'Localização não especificada'}</p>
              <button 
                onclick="window.selectRequest && window.selectRequest('${request.id}')"
                style="
                  background: #ef4444; 
                  color: white; 
                  border: none; 
                  padding: 6px 12px; 
                  border-radius: 4px; 
                  font-size: 12px; 
                  cursor: pointer;
                  font-weight: 500;
                "
              >
                Ver Detalhes
              </button>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        newMarkers.push(marker);
      });

      // Set global function for request selection
      (window as any).selectRequest = (requestId: string) => {
        if (onRequestSelect) {
          onRequestSelect(requestId);
        }
      };

      setMarkers(newMarkers);
      
      // Center map on user location
      map.setCenter({ lat: userLocation.lat, lng: userLocation.lng });
    }
  }, [map, userLocation, serviceRequests, onRequestSelect]);

  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return 'A combinar';
    if (min && max && min !== max) return `R$ ${min} - R$ ${max}`;
    if (min) return `R$ ${min}`;
    if (max) return `R$ ${max}`;
    return 'A combinar';
  };

  return <div ref={ref} style={{ width: '100%', height: '100%' }} />;
};

export default HelpRequestsMap;