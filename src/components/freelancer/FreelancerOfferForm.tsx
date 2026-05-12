
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
import FreelancerTermsDialog from '@/components/terms/FreelancerTermsDialog';

const FreelancerOfferForm: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    price: '',
    availability: '',
    experience: ''
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [showTerms, setShowTerms] = useState(false);

  const validateForm = () => {
    if (!formData.title || !formData.description || !formData.category || !formData.price) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setShowTerms(true);
  };

  const handleAfterTerms = () => {
    setShowTerms(false);

    // Create freelancer offer
    const offer = {
      id: Date.now().toString(),
      freelancerId: user?.id || 'current-user',
      name: user?.user_metadata?.first_name ? 
        `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim() : 
        user?.email?.split('@')[0] || 'Freelancer',
      title: formData.title,
      description: formData.description,
      category: formData.category,
      location: formData.location || 'São Paulo, SP',
      price: formData.price,
      availability: formData.availability,
      experience: formData.experience,
      photos,
      rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
      ratingCount: Math.floor(Math.random() * 50) + 10,
      distance: `${(Math.random() * 10 + 1).toFixed(1)}km`,
      categories: [formData.category],
      avatar: '/placeholder.svg',
      verified: true,
      created_at: new Date().toISOString()
    };

    // Save to localStorage (in a real app, this would go to backend)
    const existingOffers = JSON.parse(localStorage.getItem('freelancerOffers') || '[]');
    existingOffers.push(offer);
    localStorage.setItem('freelancerOffers', JSON.stringify(existingOffers));

    toast({
      title: "Oferta publicada!",
      description: "Sua oferta de serviço foi publicada com sucesso!",
    });

    // Reset form
    setFormData({
      title: '',
      description: '',
      category: '',
      location: '',
      price: '',
      availability: '',
      experience: ''
    });
    setPhotos([]);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddPhoto = () => {
    if (photos.length < 5) {
      setPhotos([...photos, '/placeholder.svg']);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
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
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Título do Serviço <span className="text-red-500">*</span>
            </label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Ex: Eletricista profissional para reparos"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Descrição <span className="text-red-500">*</span>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="location" className="block text-sm font-medium mb-1">
                Área de Atendimento
              </label>
              <div className="relative">
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Ex: Vila Madalena, São Paulo"
                  className="pl-10"
                />
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium mb-1">
                Preço <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  id="price"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="Ex: R$ 50/hora"
                  className="pl-10"
                  required
                />
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="availability" className="block text-sm font-medium mb-1">
              Disponibilidade
            </label>
            <div className="relative">
              <Input
                id="availability"
                value={formData.availability}
                onChange={(e) => handleInputChange('availability', e.target.value)}
                placeholder="Ex: Segunda a Sexta, 8h às 18h"
                className="pl-10"
              />
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label htmlFor="experience" className="block text-sm font-medium mb-1">
              Experiência
            </label>
            <Textarea
              id="experience"
              value={formData.experience}
              onChange={(e) => handleInputChange('experience', e.target.value)}
              placeholder="Conte sobre sua experiência, certificações, trabalhos anteriores..."
              className="min-h-[80px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Fotos dos Trabalhos</label>
            <div className="flex flex-wrap gap-2">
              {photos.map((photo, index) => (
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
              
              {photos.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddPhoto}
                  className="w-20 h-20 flex items-center justify-center border border-dashed border-gray-300 rounded-md hover:border-helpaqui-purple"
                >
                  <Plus className="h-6 w-6 text-gray-400" />
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Adicione até 5 fotos dos seus trabalhos
            </p>
          </div>

          <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90">
            Publicar Oferta de Serviço
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FreelancerOfferForm;
