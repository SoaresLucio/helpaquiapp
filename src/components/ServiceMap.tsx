
import React, { useState, useEffect } from 'react';
import { MapPin, Locate } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { mockProfessionals } from '@/data/mockData';
import { useToast } from '@/components/ui/use-toast';
import { Bike, Car, Wrench, Home, Computer, Pen, Camera, Music, Palette, ShoppingBag } from 'lucide-react';

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
  
  // Simulação do mapa carregado
  useEffect(() => {
    setTimeout(() => {
      setMapReady(true);
    }, 1500);
  }, []);

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
      <div className="relative bg-gray-200 h-[300px] w-full flex items-center justify-center">
        {!mapReady ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-helpaqui-blue mx-auto mb-2"></div>
            <p className="text-gray-600">Carregando mapa...</p>
          </div>
        ) : (
          <div className="w-full h-full bg-gray-200 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="bg-white p-3 rounded-lg shadow-md text-sm text-center">
                Mapa simulado: {filteredProfessionals.length} profissionais encontrados em um raio de {radius[0]}km
                <br />
                <span className="text-xs text-gray-500">
                  (Coordenadas: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)})
                </span>
              </p>
            </div>
            
            {/* Pontos simulados de profissionais no mapa com animação e ícones por categoria */}
            {filteredProfessionals.map((pro, index) => (
              <div 
                key={pro.id}
                className="absolute w-8 h-8 rounded-full bg-white border-2 border-helpaqui-blue shadow-lg flex items-center justify-center animate-pulse-light z-10 transform hover:scale-110 transition-transform cursor-pointer"
                style={{
                  left: `${Math.random() * 80 + 10}%`,
                  top: `${Math.random() * 80 + 10}%`,
                  animationDelay: `${index * 0.2}s`,
                }}
                title={`${pro.name} - ${pro.distance} - ${pro.categories.join(", ")}`}
              >
                {getCategoryIcon(pro.categories)}
                
                {/* Popup ao passar o mouse */}
                <div className="absolute opacity-0 hover:opacity-100 bottom-full mb-2 w-48 bg-white p-2 rounded shadow-lg text-xs pointer-events-none z-20 transition-opacity">
                  <p className="font-bold">{pro.name}</p>
                  <p>{pro.categories.join(", ")}</p>
                  <p className="text-green-600">Distância: {pro.distance}</p>
                  <div className="flex items-center mt-1">
                    <div className="text-yellow-500 flex">
                      {"★".repeat(Math.floor(pro.rating))}
                      {"☆".repeat(5 - Math.floor(pro.rating))}
                    </div>
                    <span className="ml-1 text-gray-600">({pro.reviews})</span>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Centro do mapa (usuário) com animação de pulso */}
            <div 
              className="absolute w-8 h-8 bg-helpaqui-green rounded-full border-2 border-white shadow-lg z-20 animate-pulse flex items-center justify-center"
              style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
            >
              <MapPin className="h-4 w-4 text-white" />
              
              {/* Ondas de pulso */}
              <div className="absolute w-12 h-12 rounded-full border-2 border-helpaqui-green opacity-70 animate-ping"></div>
              <div className="absolute w-16 h-16 rounded-full border-2 border-helpaqui-green opacity-30 animate-ping" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceMap;
