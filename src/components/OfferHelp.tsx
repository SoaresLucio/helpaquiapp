
import React, { useState } from 'react';
import { 
  Camera, 
  MapPin, 
  DollarSign,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { serviceCategories } from '@/data/mockData';
import { useToast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { createFreelancerProfile } from '@/services/freelancersService';

const OfferHelp: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [rate, setRate] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [addingCustom, setAddingCustom] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [observations, setObservations] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!description || categories.length === 0) {
      toast({
        title: "Atenção",
        description: "Por favor, preencha a descrição e selecione pelo menos uma categoria.",
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
      // Usar a primeira categoria selecionada (pode ser melhorado para suportar múltiplas)
      const primaryCategory = categories[0];
      
      // Preparar dados para inserção no banco
      const profileData = {
        user_id: user.id,
        category: primaryCategory,
        description: description,
        portfolio_photos: photos,
        observations: observations || `Localização: ${location}`,
        hourly_rate: rate ? Math.round(parseFloat(rate) * 100) : null, // Converter para centavos
        available: true
      };

      // Criar perfil no banco de dados
      await createFreelancerProfile(profileData);

      toast({
        title: "Oferta publicada com sucesso!",
        description: "Sua oferta de serviço foi publicada e já aparece para os clientes!",
      });

      // Resetar o formulário
      setTitle('');
      setDescription('');
      setCategories([]);
      setLocation('');
      setRate('');
      setPhotos([]);
      setObservations('');
      setCustomCategory('');
      setAddingCustom(false);

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
  
  const toggleCategory = (categoryId: string) => {
    if (categories.includes(categoryId)) {
      setCategories(categories.filter(id => id !== categoryId));
    } else {
      setCategories([...categories, categoryId]);
    }
  };
  
  const handleAddCustomCategory = () => {
    if (customCategory.trim() && !categories.includes(customCategory)) {
      setCategories([...categories, customCategory]);
      setCustomCategory('');
      setAddingCustom(false);
    }
  };
  
  const handleAddPhoto = () => {
    // Simulação de upload de foto
    const newPhoto = '/placeholder.svg';
    setPhotos([...photos, newPhoto]);
  };
  
  const handleRemovePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  return (
    <div className="helpaqui-card p-5">
      <h2 className="text-xl font-semibold mb-4 text-helpaqui-green">Oferecer um Help</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Título */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Título do serviço
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Eletricista especializado em residências"
              className="helpaqui-input"
            />
          </div>
          
          {/* Descrição */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Descrição <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva detalhadamente os serviços que você oferece..."
              className="helpaqui-input min-h-[100px]"
              required
            />
          </div>
          
          {/* Categorias */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Categorias <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {serviceCategories.map((cat) => (
                <div key={cat.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`category-${cat.id}`}
                    checked={categories.includes(cat.id)}
                    onCheckedChange={() => toggleCategory(cat.id)}
                  />
                  <Label htmlFor={`category-${cat.id}`}>{cat.name}</Label>
                </div>
              ))}
            </div>
            
            {addingCustom ? (
              <div className="flex space-x-2 mt-2">
                <Input
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Digite nova categoria"
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  onClick={handleAddCustomCategory} 
                  variant="outline"
                >
                  Adicionar
                </Button>
                <Button 
                  type="button" 
                  onClick={() => setAddingCustom(false)} 
                  variant="ghost"
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <Button 
                type="button" 
                onClick={() => setAddingCustom(true)} 
                variant="outline" 
                className="mt-2 w-full"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" /> Adicionar Categoria Personalizada
              </Button>
            )}
            
            {categories.length > 0 && categories.some(cat => !serviceCategories.some(c => c.id === cat)) && (
              <div className="mt-2">
                <p className="text-sm font-medium mb-1">Categorias personalizadas:</p>
                <div className="flex flex-wrap gap-1">
                  {categories
                    .filter(cat => !serviceCategories.some(c => c.id === cat))
                    .map(cat => (
                      <div key={cat} className="bg-gray-100 px-2 py-1 rounded-md text-xs flex items-center">
                        {cat}
                        <button 
                          type="button" 
                          onClick={() => toggleCategory(cat)} 
                          className="ml-1 text-gray-500 hover:text-red-500"
                        >
                          ×
                        </button>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>
          
          {/* Localização */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium mb-1">
              Área de atendimento
            </label>
            <div className="relative">
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Bairros Oeste de São Paulo"
                className="helpaqui-input pl-10"
              />
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          {/* Valor/Taxa */}
          <div>
            <label htmlFor="rate" className="block text-sm font-medium mb-1">
              Valor/Hora (R$)
            </label>
            <div className="relative">
              <Input
                id="rate"
                type="number"
                step="0.01"
                min="0"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="Ex: 80.00"
                className="helpaqui-input pl-10"
              />
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Observações */}
          <div>
            <label htmlFor="observations" className="block text-sm font-medium mb-1">
              Observações Adicionais
            </label>
            <Textarea
              id="observations"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Informações extras sobre disponibilidade, experiência, etc..."
              className="helpaqui-input min-h-[80px]"
            />
          </div>
          
          {/* Fotos */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Fotos de trabalhos anteriores
            </label>
            <div className="flex flex-wrap gap-2">
              {photos.map((photo, index) => (
                <div key={index} className="relative w-20 h-20 rounded-md overflow-hidden border border-gray-200">
                  <img src={photo} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-md p-1"
                    aria-label="Remover foto"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6L6 18"></path>
                      <path d="M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={handleAddPhoto}
                className="w-20 h-20 flex items-center justify-center border border-dashed border-gray-300 rounded-md hover:border-helpaqui-green"
                aria-label="Adicionar foto"
              >
                <Plus className="h-6 w-6 text-gray-400" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Adicione fotos de trabalhos anteriores para destacar suas habilidades
            </p>
          </div>
          
          <Button 
            type="submit" 
            className="helpaqui-button-green w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Publicando...
              </>
            ) : (
              'Publicar Oferta de Help'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OfferHelp;
