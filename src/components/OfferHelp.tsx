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
import { serviceCategories } from '@/data/mockData';
import { useToast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const OfferHelp: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [rate, setRate] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [addingCustom, setAddingCustom] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para oferecer serviços.",
        variant: "destructive",
      });
      return;
    }
    
    // Validação básica
    if (!title || !description || categories.length === 0 || !rate) {
      toast({
        title: "Atenção",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Separar categorias padrão das personalizadas
      const standardCategories = categories.filter(cat => 
        serviceCategories.some(c => c.id === cat)
      );
      const customCategories = categories.filter(cat => 
        !serviceCategories.some(c => c.id === cat)
      );
      
      const { data, error } = await supabase
        .from('freelancer_service_offers')
        .insert([
          {
            freelancer_id: user.id,
            title,
            description,
            categories: standardCategories,
            custom_categories: customCategories,
            location: location || null,
            rate,
            photos,
            is_active: true
          }
        ])
        .select();

      if (error) {
        throw error;
      }

      console.log('Oferta criada com sucesso:', data);

      toast({
        title: "Oferta publicada! 🎉",
        description: "Sua oferta de serviço foi publicada e já está visível para os clientes!",
      });
      
      // Resetar o formulário
      setTitle('');
      setDescription('');
      setCategories([]);
      setLocation('');
      setRate('');
      setPhotos([]);
      setCustomCategory('');
      setAddingCustom(false);
      
      // Trigger a custom event to notify other components
      window.dispatchEvent(new CustomEvent('newOfferCreated', { detail: data[0] }));
      
    } catch (error) {
      console.error('Erro ao salvar oferta:', error);
      toast({
        title: "Erro",
        description: "Erro ao publicar oferta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
              Título do serviço <span className="text-red-500">*</span>
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Eletricista especializado em residências"
              className="helpaqui-input"
              required
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
              Valor/Hora ou Taxa <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                id="rate"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="Ex: R$ 80/hora ou A combinar"
                className="helpaqui-input pl-10"
                required
              />
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
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
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Publicando...' : 'Publicar Oferta de Help'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OfferHelp;
