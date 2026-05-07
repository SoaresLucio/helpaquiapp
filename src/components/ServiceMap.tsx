
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Locate } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { config } from '@/config/environment';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

declare global {
  interface Window {
    google: typeof google;
  }
}

interface ServiceMapProps {
  selectedCategory?: string | null;
}

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface MapMarkerData {
  id: string;
  title: string;
  description: string;
  category: string;
  lat: number;
  lng: number;
  extra: string;
}

const ServiceMap: React.FC<ServiceMapProps> = ({ selectedCategory }) => {
  const [radius, setRadius] = useState<number[]>([10]);
  const [userLocation, setUserLocation] = useState<Location>({
    lat: -23.5505,
    lng: -46.6333,
    address: "São Paulo, SP"
  });
  const [isLocating, setIsLocating] = useState(false);
  const [mapMarkers, setMapMarkers] = useState<MapMarkerData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { userType } = useAuth();

  // Fetch real data based on user type
  useEffect(() => {
    const fetchMapData = async () => {
      setLoading(true);
      try {
        if (userType === 'solicitante') {
          // Solicitante sees freelancer offers
          const { data, error } = await supabase
            .from('freelancer_service_offers')
            .select('id, title, description, categories, location, rate, freelancer_id')
            .eq('is_active', true)
            .limit(50);

          if (error) throw error;

          const markers: MapMarkerData[] = (data || []).map(offer => ({
            id: offer.id,
            title: offer.title,
            description: offer.description || '',
            category: (offer.categories || []).join(', '),
            lat: userLocation.lat + (Math.random() - 0.5) * 0.05,
            lng: userLocation.lng + (Math.random() - 0.5) * 0.05,
            extra: `💰 ${offer.rate}`
          }));

          setMapMarkers(markers);
        } else {
          // Freelancer sees service requests
          const { data: rawData, error } = await supabase
            .from('service_requests_public' as any)
            .select('id, title, description, category, approx_lat, approx_lng, approx_address, budget_min, budget_max, urgency')
            .limit(50);

          if (error) throw error;
          const data = (rawData ?? []) as unknown as Array<{
            id: string; title: string; description: string | null; category: string;
            approx_lat: number | null; approx_lng: number | null; approx_address: string | null;
            budget_min: number | null; budget_max: number | null; urgency: string | null;
          }>;

          const markers: MapMarkerData[] = data.map(req => ({
            id: req.id,
            title: req.title,
            description: req.description || '',
            category: req.category,
            lat: req.approx_lat ?? userLocation.lat + (Math.random() - 0.5) * 0.05,
            lng: req.approx_lng ?? userLocation.lng + (Math.random() - 0.5) * 0.05,
            extra: req.budget_min && req.budget_max
              ? `💰 R$${req.budget_min} - R$${req.budget_max}`
              : req.urgency === 'urgent' ? '🔴 Urgente' : '🟢 Normal'
          }));

          setMapMarkers(markers);
        }
      } catch (err) {
        console.error('Error fetching map data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMapData();
  }, [userType, userLocation.lat, userLocation.lng]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Erro", description: "Seu navegador não suporta geolocalização", variant: "destructive" });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          address: "Localização atual"
        });
        toast({ title: "Localização obtida", description: "Sua localização foi atualizada!" });
        setIsLocating(false);
      },
      () => {
        toast({ title: "Erro", description: "Não foi possível obter sua localização", variant: "destructive" });
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      handleGetCurrentLocation();
    }
  }, []);

  const mapLabel = userType === 'solicitante'
    ? 'Freelancers oferecendo serviços'
    : 'Solicitações de serviço disponíveis';

  const markerColor = userType === 'solicitante' ? '#2563eb' : '#f59e0b';

  const AsyncWrapper = ({ render }: { render: (status: Status) => React.ReactElement }) => {
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [keyLoading, setKeyLoading] = useState(true);

    useEffect(() => {
      config.googleMaps.getApiKey().then(key => {
        setApiKey(key);
        setKeyLoading(false);
      }).catch(() => {
        setApiKey('YOUR_GOOGLE_MAPS_API_KEY_HERE');
        setKeyLoading(false);
      });
    }, []);

    if (keyLoading || !apiKey) {
      return <div className="h-96 flex items-center justify-center text-muted-foreground">Carregando mapa...</div>;
    }

    if (apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
      return (
        <div className="h-96 flex items-center justify-center text-destructive text-sm">
          ⚠️ Google Maps API key não configurada.
        </div>
      );
    }

    return <Wrapper apiKey={apiKey} render={render} />;
  };

  const render = (status: Status) => {
    if (status === Status.LOADING) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    if (status === Status.FAILURE) return <div className="flex items-center justify-center h-full text-destructive">Erro ao carregar mapa</div>;
    return <GoogleMapComponent userLocation={userLocation} markers={mapMarkers} markerColor={markerColor} />;
  };

  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-md border">
      <div className="p-4 bg-muted/50 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">{mapLabel}</h3>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{userLocation.address}</span>
          </div>
        </div>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm">Raio de busca: {radius[0]} km</span>
            <Button variant="outline" size="sm" className="text-xs flex items-center gap-1" onClick={handleGetCurrentLocation} disabled={isLocating}>
              <Locate className={`h-3 w-3 ${isLocating ? "animate-spin" : ""}`} />
              {isLocating ? "Localizando..." : "Atualizar"}
            </Button>
          </div>
          <Slider value={radius} min={1} max={20} step={1} className="my-4" onValueChange={setRadius} />
        </div>
        <div className="text-xs text-muted-foreground">
          📍 {loading ? 'Carregando dados...' : `${mapMarkers.length} resultados encontrados`}
        </div>
      </div>
      <div className="relative bg-muted h-[300px] w-full">
        <AsyncWrapper render={render} />
      </div>
    </div>
  );
};

interface GoogleMapComponentProps {
  userLocation: Location;
  markers: MapMarkerData[];
  markerColor: string;
}

const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({ userLocation, markers, markerColor }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    if (ref.current && !map && window.google) {
      setMap(new window.google.maps.Map(ref.current, {
        center: { lat: userLocation.lat, lng: userLocation.lng },
        zoom: 12,
      }));
    }
  }, [ref, map, userLocation]);

  useEffect(() => {
    if (!map || !window.google) return;

    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    // User marker
    const userMarker = new window.google.maps.Marker({
      position: { lat: userLocation.lat, lng: userLocation.lng },
      map,
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
    markersRef.current.push(userMarker);

    markers.forEach(item => {
      const marker = new window.google.maps.Marker({
        position: { lat: item.lat, lng: item.lng },
        map,
        title: item.title,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
              <circle cx="18" cy="18" r="14" fill="${markerColor}" stroke="white" stroke-width="3"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(36, 36)
        }
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding:8px;max-width:250px;">
            <h3 style="margin:0 0 4px;font-weight:bold;font-size:14px;">${item.title}</h3>
            <p style="margin:0 0 4px;color:#666;font-size:12px;">${item.category}</p>
            <p style="margin:0 0 4px;font-size:12px;">${item.description.substring(0, 100)}${item.description.length > 100 ? '...' : ''}</p>
            <p style="margin:0;font-size:12px;color:#10b981;">${item.extra}</p>
          </div>
        `
      });
      marker.addListener('click', () => infoWindow.open(map, marker));
      markersRef.current.push(marker);
    });

    map.setCenter({ lat: userLocation.lat, lng: userLocation.lng });
  }, [map, userLocation, markers, markerColor]);

  return <div ref={ref} style={{ width: '100%', height: '100%' }} />;
};

export default ServiceMap;
