import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, DollarSign, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface HelpsMapRequest {
  id: string;
  title: string;
  description: string | null;
  category: string;
  approx_lat: number | null;
  approx_lng: number | null;
  approx_address: string | null;
  budget_min: number | null;
  budget_max: number | null;
  urgency: string | null;
}

interface HelpsMapProps {
  onRequestSelect?: (id: string) => void;
  initialCenter?: [number, number];
}

// Cores semânticas por categoria (HSL para alinhar com tokens)
const categoryColors: Record<string, string> = {
  Limpeza: 'hsl(197, 71%, 52%)',
  Construção: 'hsl(25, 85%, 53%)',
  Reparos: 'hsl(45, 93%, 47%)',
  Motoboy: 'hsl(0, 75%, 55%)',
  Escritório: 'hsl(160, 60%, 40%)',
  Outros: 'hsl(272, 55%, 40%)',
};

const colorForCategory = (cat: string) => categoryColors[cat] ?? 'hsl(var(--primary))';

const buildIcon = (category: string) => {
  const color = colorForCategory(category);
  const html = `
    <div style="
      width: 32px; height: 42px; position: relative;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    ">
      <svg viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg" width="32" height="42">
        <path d="M16 0C7.16 0 0 7.16 0 16c0 11 16 26 16 26s16-15 16-26C32 7.16 24.84 0 16 0z" fill="${color}"/>
        <circle cx="16" cy="16" r="6" fill="white"/>
      </svg>
    </div>`;
  return L.divIcon({
    html,
    className: 'helps-map-pin',
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -36],
  });
};

const FitBounds: React.FC<{ points: [number, number][] }> = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [points, map]);
  return null;
};

const formatBudget = (min: number | null, max: number | null) => {
  if (!min && !max) return 'A combinar';
  if (min && max && min !== max) return `R$ ${min} - R$ ${max}`;
  return `R$ ${min ?? max}`;
};

const HelpsMap: React.FC<HelpsMapProps> = ({ onRequestSelect, initialCenter = [-23.5505, -46.6333] }) => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<HelpsMapRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('service_requests_public' as any)
          .select('id, title, description, category, approx_lat, approx_lng, approx_address, budget_min, budget_max, urgency')
          .not('approx_lat', 'is', null)
          .not('approx_lng', 'is', null);

        if (error) throw error;
        if (mounted) setRequests((data ?? []) as unknown as HelpsMapRequest[]);
      } catch (err) {
        console.error('HelpsMap load error', err);
        toast({
          title: 'Erro ao carregar mapa',
          description: 'Não foi possível buscar as solicitações.',
          variant: 'destructive',
        });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    const channel = supabase
      .channel('helps-map-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_requests' }, load)
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const points = useMemo<[number, number][]>(
    () =>
      requests
        .filter((r) => r.approx_lat != null && r.approx_lng != null)
        .map((r) => [r.approx_lat as number, r.approx_lng as number]),
    [requests]
  );

  if (loading) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Carregando mapa">
        <Skeleton className="h-[480px] w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-2xl overflow-hidden border border-border shadow-lg"
    >
      <MapContainer
        center={initialCenter}
        zoom={12}
        style={{ height: '70vh', minHeight: 480, width: '100%' }}
        scrollWheelZoom
        aria-label="Mapa de solicitações de help"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />
        <MarkerClusterGroup chunkedLoading showCoverageOnHover={false}>
          {requests.map((r) => {
            if (r.approx_lat == null || r.approx_lng == null) return null;
            return (
              <Marker
                key={r.id}
                position={[r.approx_lat, r.approx_lng]}
                icon={buildIcon(r.category)}
              >
                <Popup minWidth={260} maxWidth={300}>
                  <Card className="border-0 shadow-none">
                    <CardHeader className="p-2 pb-1">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base leading-tight">{r.title}</CardTitle>
                        {r.urgency === 'urgent' && <Badge variant="destructive">Urgente</Badge>}
                      </div>
                      <Badge variant="secondary" className="w-fit mt-1">{r.category}</Badge>
                    </CardHeader>
                    <CardContent className="p-2 pt-1 space-y-2 text-sm">
                      {r.approx_address && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" aria-hidden />
                          <span>{r.approx_address} <em className="text-[10px]">(aprox.)</em></span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <DollarSign className="h-3.5 w-3.5" aria-hidden />
                        <span>{formatBudget(r.budget_min, r.budget_max)}</span>
                      </div>
                      <Button
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => onRequestSelect?.(r.id)}
                        aria-label={`Ver detalhes do pedido ${r.title}`}
                      >
                        Ver detalhes <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-[400] bg-background/95 backdrop-blur rounded-xl border border-border shadow p-3 text-xs">
        <p className="font-semibold mb-1.5">Categorias</p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          {Object.entries(categoryColors).map(([name, color]) => (
            <div key={name} className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color }} aria-hidden />
              <span>{name}</span>
            </div>
          ))}
        </div>
      </div>

      {requests.length === 0 && (
        <div className="absolute inset-0 z-[500] flex items-center justify-center bg-background/70 backdrop-blur-sm">
          <Card className="max-w-sm">
            <CardContent className="p-6 text-center">
              <MapPin className="h-10 w-10 mx-auto mb-3 text-muted-foreground" aria-hidden />
              <p className="text-sm text-muted-foreground">Nenhuma solicitação aberta com localização no momento.</p>
            </CardContent>
          </Card>
        </div>
      )}
    </motion.div>
  );
};

export default HelpsMap;
