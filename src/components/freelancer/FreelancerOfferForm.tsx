
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, DollarSign, Clock, Plus } from 'lucide-react';
import { serviceCategories } from '@/data/mockData';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { createFreelancerProfile } from '@/services/freelancersService';

const FreelancerOfferForm: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    hourly_rate: '',
    observations: '',
    portfolio_photos: [] as string[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category || !formData.description) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha categoria e descrição",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para criar uma oferta",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Preparar dados para inserção no banco
      const profileData = {
        user_id: user.id,
        category: formData.category,
        description: formData.description,
        portfolio_photos: formData.portfolio_photos,
        observations: formData.observations || null,
        hourly_rate: formData.hourly_rate ? Math.round(parseFloat(formData.hourly_rate) * 100) : null, // Converter para centavos
        available: true
      };

      // Criar perfil no banco de dados
      await createFreelancerProfile(profileData);

      toast({
        title: "Oferta publicada!",
        description: "Sua oferta de serviço foi publicada com sucesso e já aparece para os clientes!",
      });

      // Reset form
      setFormData({
        category: '',
        description: '',
        hourly_rate: '',
        observations: '',
        portfolio_photos: []
      });

    } catch (error: any) {
      console.error('Error creating freelancer profile:', error);
      toast({
        title: "Erro ao publicar oferta",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddPhoto = () => {
    if (formData.portfolio_photos.length < 5) {
      setFormData(prev => ({
        ...prev,
        portfolio_photos: [...prev.portfolio_photos, '/placeholder.svg']
      }));
    }
  };

  const handleRemovePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      portfolio_photos: prev.portfolio_photos.filter((_, i) => i !== index)
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Publicar Oferta de Serviço</CardTitle>
        <CardDescription>
          Ofereça seus serviços e apareça para clientes próximos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1">
              Categoria <span className="text-red-500">*</span>
            </label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione sua especialidade" />
              </SelectTrigger>
              <SelectContent>
                {serviceCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Descrição dos Serviços <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descreva seus serviços, experiência e diferenciais..."
              className="min-h-[100px]"
              required
            />
          </div>

          <div>
            <label htmlFor="hourly_rate" className="block text-sm font-medium mb-1">
              Preço por Hora
            </label>
            <div className="relative">
              <Input
                id="hourly_rate"
                type="number"
                step="0.01"
                min="0"
                value={formData.hourly_rate}
                onChange={(e) => handleInputChange('hourly_rate', e.target.value)}
                placeholder="Ex: 50.00"
                className="pl-10"
              />
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label htmlFor="observations" className="block text-sm font-medium mb-1">
              Observações Adicionais
            </label>
            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) => handleInputChange('observations', e.target.value)}
              placeholder="Informações extras sobre disponibilidade, área de atendimento, etc..."
              className="min-h-[80px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Fotos dos Trabalhos</label>
            <div className="flex flex-wrap gap-2">
              {formData.portfolio_photos.map((photo, index) => (
                <div key={index} className="relative w-20 h-20 rounded-md overflow-hidden border border-gray-200">
                  <img src={photo} alt={`Trabalho ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-md p-1"
                  >
                    ×
                  </button>
                </div>
              ))}
              
              {formData.portfolio_photos.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddPhoto}
                  className="w-20 h-20 flex items-center justify-center border border-dashed border-gray-300 rounded-md hover:border-helpaqui-blue"
                >
                  <Plus className="h-6 w-6 text-gray-400" />
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Adicione até 5 fotos dos seus trabalhos
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-helpaqui-green hover:bg-helpaqui-green/90"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Publicando...
              </>
            ) : (
              'Publicar Oferta de Serviço'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FreelancerOfferForm;
