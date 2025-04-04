
import React, { useState } from 'react';
import { MapPin, Locate } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { mockProfessionals } from '@/data/mockData';

interface ServiceMapProps {
  selectedCategory: string | null;
}

const ServiceMap: React.FC<ServiceMapProps> = ({ selectedCategory }) => {
  const [radius, setRadius] = useState<number[]>([5]);
  const [mapReady, setMapReady] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  
  // Simulação do mapa carregado
  React.useEffect(() => {
    setTimeout(() => {
      setMapReady(true);
    }, 1500);
  }, []);
  
  // Filtragem de profissionais por categoria
  const filteredProfessionals = selectedCategory 
    ? mockProfessionals.filter(pro => pro.categories.includes(selectedCategory))
    : mockProfessionals;

  const handleTriggerMapWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl) {
      console.log("Por favor, insira a URL do webhook do Zapier");
      return;
    }

    console.log("Enviando dados do mapa para Zapier:", webhookUrl);
    try {
      fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          radius: radius[0],
          selectedCategory,
          location: {
            lat: -23.5505,
            lng: -46.6333,
            address: "São Paulo, SP"
          }
        }),
      });
      console.log("Solicitação enviada ao Zapier");
    } catch (error) {
      console.error("Erro ao acionar webhook:", error);
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
            <span>São Paulo, SP</span>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-700">Raio de busca: {radius[0]} km</span>
            <Button
              variant="outline"
              size="sm"
              className="text-xs flex items-center gap-1"
              onClick={() => console.log("Buscando localização atual...")}
            >
              <Locate className="h-3 w-3" />
              Atual
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
        
        {/* Zapier Webhook Input para integração com Google Maps */}
        <div className="mb-3">
          <label htmlFor="webhook-url" className="block text-sm font-medium text-gray-700 mb-1">
            URL Webhook Zapier (Google Maps)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="webhook-url"
              className="helpaqui-input flex-1 text-sm"
              placeholder="Cole a URL do webhook Zapier"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
            <Button 
              className="helpaqui-button-secondary text-sm"
              onClick={handleTriggerMapWebhook}
            >
              Conectar
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Conecte ao Zapier para usar a localização em tempo real
          </p>
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
                  (Integração real com Google Maps via Zapier)
                </span>
              </p>
            </div>
            
            {/* Pontos simulados de profissionais no mapa */}
            {filteredProfessionals.map((pro, index) => (
              <div 
                key={pro.id}
                className="absolute w-4 h-4 bg-helpaqui-blue rounded-full animate-pulse-light"
                style={{
                  left: `${Math.random() * 80 + 10}%`,
                  top: `${Math.random() * 80 + 10}%`,
                }}
                title={`${pro.name} - ${pro.distance}`}
              />
            ))}
            
            {/* Centro do mapa (usuário) */}
            <div 
              className="absolute w-6 h-6 bg-helpaqui-green rounded-full border-2 border-white"
              style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceMap;
