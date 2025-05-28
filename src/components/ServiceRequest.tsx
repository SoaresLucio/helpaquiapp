import React, { useState } from 'react';
import { 
  Camera, 
  MapPin, 
  Calendar, 
  DollarSign,
  Plus,
  AlertCircle
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import AsaasPaymentButton from './payment/AsaasPaymentButton';

const ServiceRequest: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    budget: '',
    date: '',
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [isVerified, setIsVerified] = useState(false);
  const [hasPaymentMethod, setHasPaymentMethod] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  
  React.useEffect(() => {
    setTimeout(() => {
      setIsVerified(Math.random() > 0.5);
      setHasPaymentMethod(Math.random() > 0.5);
    }, 1000);
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isVerified || !hasPaymentMethod) {
      toast({
        title: "Verificação necessária",
        description: "Complete a verificação e adicione um método de pagamento",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.title || !formData.description || !formData.category || !formData.location) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }
    
    setShowPayment(true);
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

  const handlePaymentComplete = () => {
    // Save service request to database/state
    const serviceRequest = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      category: formData.category,
      location: formData.location,
      budget: formData.budget,
      date: formData.date,
      photos,
      status: 'active',
      created_at: new Date().toISOString()
    };

    // Add to localStorage for now (in a real app, this would be sent to backend)
    const existingRequests = JSON.parse(localStorage.getItem('serviceRequests') || '[]');
    existingRequests.push(serviceRequest);
    localStorage.setItem('serviceRequests', JSON.stringify(existingRequests));

    toast({
      title: "Trabalho publicado",
      description: "Seu pedido de HELP foi publicado com sucesso!",
    });
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      category: '',
      location: '',
      budget: '',
      date: '',
    });
    setPhotos([]);
    setShowPayment(false);
  };

  if (showPayment) {
    return (
      <div className="helpaqui-card p-5">
        <h2 className="text-xl font-semibold mb-4 text-helpaqui-blue">Finalizar Publicação</h2>
        
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">{formData.title}</h3>
          <p className="text-sm text-gray-600 mb-2">{formData.description}</p>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {formData.location}
            </span>
            {formData.budget && (
              <span className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {formData.budget}
              </span>
            )}
          </div>
        </div>

        <AsaasPaymentButton
          amount={parseInt(formData.budget.replace(/\D/g, '')) * 100 || 5000}
          serviceId="temp-service-id"
          freelancerId="temp-freelancer-id"
          description={formData.description}
          onPaymentComplete={handlePaymentComplete}
        />
        
        <Button 
          variant="outline" 
          onClick={() => setShowPayment(false)}
          className="w-full mt-2"
        >
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="helpaqui-card p-5">
      <h2 className="text-xl font-semibold mb-4 text-helpaqui-blue">Pedir um HELP</h2>
      
      {(!isVerified || !hasPaymentMethod) && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {!isVerified && !hasPaymentMethod ? (
              "É necessário verificar seu cadastro e adicionar um método de pagamento."
            ) : !isVerified ? (
              "É necessário verificar seu cadastro antes de solicitar serviços."
            ) : (
              "É necessário adicionar um método de pagamento antes de solicitar serviços."
            )}
            <div className="mt-2 space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigate("/verification")}>
                Verificar cadastro
              </Button>
              {!hasPaymentMethod && (
                <Button variant="outline" size="sm" onClick={() => navigate("/payments")}>
                  Adicionar pagamento
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Título <span className="text-red-500">*</span>
          </label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Ex: Preciso de um eletricista para reparo em tomada"
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
            placeholder="Descreva detalhadamente o serviço que você precisa..."
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
              <SelectValue placeholder="Selecione uma categoria" />
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
              Localização <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Digite seu endereço"
                className="pl-10"
                required
              />
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <div>
            <label htmlFor="budget" className="block text-sm font-medium mb-1">
              Orçamento
            </label>
            <div className="relative">
              <Input
                id="budget"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                placeholder="Ex: R$50-100"
                className="pl-10"
              />
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
        
        <div>
          <label htmlFor="date" className="block text-sm font-medium mb-1">
            Data Desejada
          </label>
          <div className="relative">
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="pl-10"
            />
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Fotos</label>
          <div className="flex flex-wrap gap-2">
            {photos.map((photo, index) => (
              <div key={index} className="relative w-20 h-20 rounded-md overflow-hidden border border-gray-200">
                <img src={photo} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
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
                className="w-20 h-20 flex items-center justify-center border border-dashed border-gray-300 rounded-md hover:border-helpaqui-blue"
              >
                <Plus className="h-6 w-6 text-gray-400" />
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Adicione até 5 fotos para ajudar os freelancers
          </p>
        </div>
        
        <Button type="submit" className="helpaqui-button-primary w-full">
          Continuar para Pagamento
        </Button>
      </form>
    </div>
  );
};

export default ServiceRequest;
