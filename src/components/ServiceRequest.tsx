
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

const ServiceRequest: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate(); // Added this for navigation
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [date, setDate] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isVerified, setIsVerified] = useState(false);
  const [hasPaymentMethod, setHasPaymentMethod] = useState(false);
  
  // For the demo, we'll simulate verification check
  React.useEffect(() => {
    // This would be a real API call in production
    setTimeout(() => {
      setIsVerified(Math.random() > 0.5);
      setHasPaymentMethod(Math.random() > 0.5);
    }, 1000);
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificação de documentos e pagamentos
    if (!isVerified || !hasPaymentMethod) {
      toast({
        title: "Verificação necessária",
        description: "Você precisa verificar seu cadastro e adicionar um método de pagamento antes de solicitar serviços.",
        variant: "destructive",
      });
      return;
    }
    
    // Validação básica
    if (!title || !description || !category || !location) {
      toast({
        title: "Atenção",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    // Aqui seria o envio para a API
    console.log({
      title,
      description,
      category,
      location,
      budget,
      date,
      photos
    });
    
    toast({
      title: "Solicitação enviada",
      description: "Seu pedido de HELP foi publicado com sucesso!",
    });
    
    // Resetar o formulário
    setTitle('');
    setDescription('');
    setCategory('');
    setLocation('');
    setBudget('');
    setDate('');
    setPhotos([]);
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
            <div className="mt-2">
              <Button variant="outline" size="sm" onClick={() => navigate("/verification")}>
                Verificar cadastro
              </Button>
              {!hasPaymentMethod && (
                <Button variant="outline" size="sm" className="ml-2" onClick={() => navigate("/payments")}>
                  Adicionar pagamento
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Título */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Título <span className="text-red-500">*</span>
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Preciso de um eletricista para reparo em tomada"
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
              placeholder="Descreva detalhadamente o serviço que você precisa..."
              className="helpaqui-input min-h-[100px]"
              required
            />
          </div>
          
          {/* Categoria */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1">
              Categoria <span className="text-red-500">*</span>
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="helpaqui-input">
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
          
          {/* Localização */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium mb-1">
              Localização <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Digite seu endereço"
                className="helpaqui-input pl-10"
                required
              />
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          {/* Orçamento */}
          <div>
            <label htmlFor="budget" className="block text-sm font-medium mb-1">
              Orçamento
            </label>
            <div className="relative">
              <Input
                id="budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Ex: R$50-100"
                className="helpaqui-input pl-10"
              />
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          {/* Data */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium mb-1">
              Data Desejada
            </label>
            <div className="relative">
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="helpaqui-input pl-10"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          {/* Fotos */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Fotos
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
                className="w-20 h-20 flex items-center justify-center border border-dashed border-gray-300 rounded-md hover:border-helpaqui-blue"
                aria-label="Adicionar foto"
              >
                <Plus className="h-6 w-6 text-gray-400" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Adicione até 5 fotos para ajudar os freelancers a entenderem melhor sua necessidade
            </p>
          </div>
          
          <Button type="submit" className="helpaqui-button-primary w-full">
            Pedir um HELP
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ServiceRequest;
