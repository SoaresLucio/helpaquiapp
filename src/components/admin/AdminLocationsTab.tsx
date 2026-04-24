
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, MapPin, RefreshCw, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserLocationData {
  user_id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  user_type: string | null;
  latitude: number | null;
  longitude: number | null;
  ip_address: string | null;
  user_created_at: string | null;
  location_updated_at: string | null;
}

const AdminLocationsTab: React.FC = () => {
  const [locations, setLocations] = useState<UserLocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_all_users_admin');
      if (error) throw error;
      setLocations((data as UserLocationData[]) || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast.error('Erro ao carregar localizações');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const filtered = locations.filter(l =>
    (l.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.ip_address || '').includes(search) ||
    (`${l.first_name || ''} ${l.last_name || ''}`).toLowerCase().includes(search.toLowerCase())
  );

  const hasValidCoords = (lat: number | null, lng: number | null) =>
    lat != null && lng != null && (lat !== 0 || lng !== 0);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Coordenadas dos Usuários</h2>
        <p className="text-muted-foreground">
          Monitoramento de localização, IP e coordenadas exatas — visível apenas para administradores
        </p>
        <Badge variant="destructive" className="mt-2">
          🔒 Acesso restrito — Apenas Administradores
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por email, nome ou IP..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" onClick={fetchLocations} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            Total de usuários: <strong>{locations.length}</strong> | Com localização: <strong>{locations.filter(l => hasValidCoords(l.latitude, l.longitude)).length}</strong>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Endereço IP</TableHead>
                    <TableHead>Latitude</TableHead>
                    <TableHead>Longitude</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead>Última Localização</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((loc) => (
                    <TableRow key={loc.user_id}>
                      <TableCell className="font-medium">
                        {loc.first_name || ''} {loc.last_name || ''}
                        {!loc.first_name && !loc.last_name && <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        <span className="max-w-[200px] truncate block text-sm">{loc.email || '—'}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs capitalize">
                          {loc.user_type || '—'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3 text-muted-foreground" />
                          <span className="font-mono text-sm">
                            {loc.ip_address ? String(loc.ip_address) : 'Não capturado'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {hasValidCoords(loc.latitude, loc.longitude) ? loc.latitude!.toFixed(6) : '—'}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {hasValidCoords(loc.latitude, loc.longitude) ? loc.longitude!.toFixed(6) : '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {loc.user_created_at ? new Date(loc.user_created_at).toLocaleString('pt-BR') : '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {loc.location_updated_at ? new Date(loc.location_updated_at).toLocaleString('pt-BR') : 'Sem dados'}
                      </TableCell>
                      <TableCell>
                        {hasValidCoords(loc.latitude, loc.longitude) ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`, '_blank')}
                          >
                            <MapPin className="h-3 w-3 mr-1" />
                            Mapa
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">Sem coordenadas</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filtered.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum usuário encontrado.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLocationsTab;
