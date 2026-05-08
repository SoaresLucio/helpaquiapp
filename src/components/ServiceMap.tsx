import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { MapPin, Locate, DollarSign } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ServiceMapProps {
  selectedCategory?: string | null;
}

interface MapPin {
  id: string;
  title: string;
  description: string;
  category: string;
  lat: number;
  lng: number;
  extra: string;
  urgent?: boolean;
}

const buildIcon = (color: string) =>
  L.divIcon({
    html: `<div style="filter:drop-shadow(0 2px 4px rgba(0,0,0,.3))"><svg width="28" height="38" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg"><path d="M16 0C7.16 0 0 7.16 0 16c0 11 16 26 16 26s16-15 16-26C32 7.16 24.84 0 16 0z" fill="${color}"/><circle cx="16" cy="16" r="6" fill="white"/></svg></div>`,
    className: 'service-map-pin',
    iconSize: [28, 38],
    iconAnchor: [14, 38],
    popupAnchor: [0, -32],
  });

const userIcon = L.divIcon({
  html: `<div style="width:24px;height:24px;border-radius:50%;background:hsl(160,84%,39%);border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>`,
  className: 'user-loc-pin',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const Recenter: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const ServiceMap: React.FC<ServiceMapProps> = ({ selectedCategory }) => {
  const { userType } = useAuth();
  const { toast } = useToast();
  const [radius, setRadius] = useState<number[]>([10]);
  const [userLocation, setUserLocation] = useState<[number, number]>([-23.5505, -46.6333]);
  const [address, setAddress] = useState('São Paulo, SP');
  const [isLocating, setIsLocating] = useState(false);
  const [pins, setPins] = useState<MapPin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        if (userType === 'solicitante') {
          const { data } = await supabase
            .from('freelancer_service_offers')
            .select('id, title, description, categories, rate')
            .eq('is_active', true)
            .limit(50);
          if (!mounted) return;
          setPins((data || []).map((o: any, i) => ({
            id: o.id,
            title: o.title,
            description: o.description || '',
            category: (o.categories || [])[0] || 'Outros',
            lat: userLocation[0] + (Math.random() - 0.5) * 0.04,
            lng: userLocation[1] + (Math.random() - 0.5) * 0.04,
            extra: `R$ ${o.rate}`,
          })));
        } else {
          const { data } = await supabase
            .from('service_requests_public' as any)
            .select('id, title, description, category, approx_lat, approx_lng, budget_min, budget_max, urgency')
            .limit(50);
          if (!mounted) return;
          setPins(((data as any[]) || []).map((r) => ({
            id: r.id,
            title: r.title,
            description: r.description || '',
            category: r.category,
            lat: r.approx_lat ?? userLocation[0] + (Math.random() - 0.5) * 0.04,
            lng: r.approx_lng ?? userLocation[1] + (Math.random() - 0.5) * 0.04,
            extra: r.budget_min ? `R$ ${r.budget_min}${r.budget_max ? ` - ${r.budget_max}` : ''}` : 'A combinar',
            urgent: r.urgency === 'urgent',
          })));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [userType, userLocation]);

  const handleLocate = () => {
    if (!navigator.geolocation) {
      toast({ title: 'Erro', description: 'Geolocalização não suportada', variant: 'destructive' });
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setAddress('Localização atual');
        setIsLocating(false);
        toast({ title: 'Localização atualizada' });
      },
      () => {
        toast({ title: 'Erro', description: 'Não foi possível obter localização', variant: 'destructive' });
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    if ('geolocation' in navigator) handleLocate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mapLabel = userType === 'solicitante' ? 'Freelancers próximos' : 'Solicitações disponíveis';
  const pinColor = userType === 'solicitante' ? 'hsl(217, 91%, 50%)' : 'hsl(272, 55%, 40%)';

  const filteredPins = useMemo(
    () => (selectedCategory ? pins.filter((p) => p.category === selectedCategory) : pins),
    [pins, selectedCategory]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card rounded-2xl overflow-hidden shadow-lg border border-border/50"
    >
      <div className="p-4 bg-muted/40 border-b border-border/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">{mapLabel}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" aria-hidden />
            <span>{address}</span>
          </div>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Raio: {radius[0]} km</span>
          <Button variant="outline" size="sm" onClick={handleLocate} disabled={isLocating} aria-label="Atualizar localização">
            <Locate className={`h-3 w-3 mr-1 ${isLocating ? 'animate-spin' : ''}`} />
            {isLocating ? 'Localizando…' : 'Atualizar'}
          </Button>
        </div>
        <Slider value={radius} min={1} max={20} step={1} onValueChange={setRadius} aria-label="Raio de busca em km" />
        <p className="text-xs text-muted-foreground mt-2">
          {loading ? 'Carregando…' : `${filteredPins.length} resultados`}
        </p>
      </div>

      <div className="relative h-[320px] w-full">
        {loading ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <MapContainer
            center={userLocation}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom
            aria-label={mapLabel}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Recenter center={userLocation} />
            <Marker position={userLocation} icon={userIcon}>
              <Popup>Você está aqui</Popup>
            </Marker>
            <MarkerClusterGroup chunkedLoading showCoverageOnHover={false}>
              {filteredPins.map((p) => (
                <Marker key={p.id} position={[p.lat, p.lng]} icon={buildIcon(pinColor)}>
                  <Popup minWidth={220}>
                    <Card className="border-0 shadow-none">
                      <CardContent className="p-2 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-sm leading-tight">{p.title}</h4>
                          {p.urgent && <Badge variant="destructive" className="text-[10px]">Urgente</Badge>}
                        </div>
                        <Badge variant="secondary" className="text-[10px]">{p.category}</Badge>
                        {p.description && <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>}
                        <div className="flex items-center gap-1 text-xs text-primary font-medium">
                          <DollarSign className="h-3 w-3" />
                          <span>{p.extra}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          </MapContainer>
        )}
      </div>
    </motion.div>
  );
};

export default ServiceMap;
