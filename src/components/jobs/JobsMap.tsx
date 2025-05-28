
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Locate } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { ServiceRequest } from '@/services/jobsService';
import { useToast } from '@/components/ui/use-toast';
import { Wrapper, Status } from '@googlemaps/react-wrapper';

interface JobsMapProps {
  jobs: ServiceRequest[];
  selectedCategory: string | null;
}

interface Location {
  lat: number;
  lng: number;
  address: string;
}

const JobsMap: React.FC<JobsMapProps> = ({ jobs, selectedCategory }) => {
  const [radius, setRadius] = useState<number[]>([10]);
  const [userLocation, setUserLocation] = useState<Location>({
    lat: -23.5505,
    lng: -46.6333,
    address: "São Paulo, SP"
  });
  const [isLocating, setIsLocating] = useState(false);
  const { toast } = useToast();

  // Filter jobs with location data
  const jobsWithLocation = jobs.filter(job => 
    job.location_lat && job.location_lng
  );

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

  useEffect(() => {
    if ("geolocation" in navigator) {
      handleGetCurrentLocation();
    }
  }, []);

  const render = (status: Status) => {
    if (status === Status.LOADING) return <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-helpaqui-blue mb-2"></div>;
    if (status === Status.FAILURE) return <div>Erro ao carregar mapa</div>;
    return <GoogleMapComponent userLocation={userLocation} jobs={jobsWithLocation} radius={radius[0]} />;
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md">
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Trabalhos próximos</h3>
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
            max={50}
            step={1}
            className="my-4"
            onValueChange={setRadius}
          />
        </div>
        
        <div className="text-xs text-gray-500">
          📍 Raio de trabalho: {radius[0]}km • {jobsWithLocation.length} trabalhos com localização
        </div>
      </div>
      
      <div className="relative bg-gray-200 h-[400px] w-full">
        <Wrapper apiKey="AIzaSyBpWI8pUwTvmUOhQ3UvXO6WBnEJ_Qz_wQs" render={render}>
          <GoogleMapComponent userLocation={userLocation} jobs={jobsWithLocation} radius={radius[0]} />
        </Wrapper>
      </div>
    </div>
  );
};

interface GoogleMapComponentProps {
  userLocation: Location;
  jobs: ServiceRequest[];
  radius: number;
}

const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({ userLocation, jobs, radius }) => {
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

      // Add radius circle
      const radiusCircle = new window.google.maps.Circle({
        strokeColor: '#10B981',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#10B981',
        fillOpacity: 0.1,
        map: map,
        center: { lat: userLocation.lat, lng: userLocation.lng },
        radius: radius * 1000 // Convert km to meters
      });

      const newMarkers = [userMarker];

      // Add job markers
      jobs.forEach((job) => {
        if (job.location_lat && job.location_lng) {
          const marker = new window.google.maps.Marker({
            position: { lat: Number(job.location_lat), lng: Number(job.location_lng) },
            map: map,
            title: job.title,
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

          const formatBudget = (min?: number | null, max?: number | null) => {
            if (!min && !max) return 'Orçamento não informado';
            if (min && max) return `R$ ${min} - R$ ${max}`;
            if (min) return `A partir de R$ ${min}`;
            if (max) return `Até R$ ${max}`;
            return 'Orçamento não informado';
          };

          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 8px; max-width: 250px;">
                <h3 style="margin: 0 0 8px 0; font-weight: bold;">${job.title}</h3>
                <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${job.category}</p>
                <p style="margin: 0 0 8px 0; color: #666; font-size: 12px;">${job.description || ''}</p>
                <p style="margin: 0 0 8px 0; color: #10b981; font-size: 14px;">💰 ${formatBudget(job.budget_min, job.budget_max)}</p>
                <div style="font-size: 12px; color: #666;">📅 ${new Date(job.created_at).toLocaleDateString('pt-BR')}</div>
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });

          newMarkers.push(marker);
        }
      });

      setMarkers(newMarkers);
      
      // Center map on user location
      map.setCenter({ lat: userLocation.lat, lng: userLocation.lng });
    }
  }, [map, userLocation, jobs, radius]);

  return <div ref={ref} style={{ width: '100%', height: '100%' }} />;
};

export default JobsMap;
