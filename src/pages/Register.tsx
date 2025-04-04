
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BriefcaseBusiness, UserRound, ArrowLeft, Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { serviceCategories } from '@/data/mockData';

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('type') || 'client';
  
  const [clientData, setClientData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    acceptTerms: false
  });
  
  const [freelancerData, setFreelancerData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    document: '',
    categories: [] as string[],
    description: '',
    acceptTerms: false
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (clientData.password !== clientData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }
    
    if (!clientData.acceptTerms) {
      toast({
        title: "Erro",
        description: "Você precisa aceitar os termos e condições",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate registration process
    setTimeout(() => {
      // In a real app, this would be an API call
      localStorage.setItem('userType', 'client');
      localStorage.setItem('userEmail', clientData.email);
      toast({
        title: "Registro bem-sucedido",
        description: "Bem-vindo ao HelpAqui!",
      });
      navigate('/');
      setIsLoading(false);
    }, 1000);
  };

  const handleFreelancerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (freelancerData.password !== freelancerData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }
    
    if (!freelancerData.acceptTerms) {
      toast({
        title: "Erro",
        description: "Você precisa aceitar os termos e condições",
        variant: "destructive",
      });
      return;
    }
    
    if (freelancerData.categories.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos uma categoria de serviço",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate registration process
    setTimeout(() => {
      // In a real app, this would be an API call
      localStorage.setItem('userType', 'freelancer');
      localStorage.setItem('userEmail', freelancerData.email);
      toast({
        title: "Registro bem-sucedido",
        description: "Bem-vindo ao HelpAqui! Seu perfil será verificado em breve.",
      });
      navigate('/');
      setIsLoading(false);
    }, 1000);
  };

  const handleClientChange = (field: string, value: any) => {
    setClientData(prev => ({ ...prev, [field]: value }));
  };

  const handleFreelancerChange = (field: string, value: any) => {
    setFreelancerData(prev => ({ ...prev, [field]: value }));
  };

  const toggleCategory = (categoryId: string) => {
    setFreelancerData(prev => {
      if (prev.categories.includes(categoryId)) {
        return { ...prev, categories: prev.categories.filter(id => id !== categoryId) };
      } else {
        return { ...prev, categories: [...prev.categories, categoryId] };
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col p-4">
      <div className="container mx-auto max-w-4xl">
        <Button 
          variant="ghost" 
          className="mb-4" 
          onClick={() => navigate('/login')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para login
        </Button>
        
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-helpaqui-blue">
            Help<span className="text-helpaqui-green">Aqui</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Crie sua conta e comece a usar agora mesmo
          </p>
        </div>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-8">
            <TabsTrigger value="client" className="flex items-center gap-2">
              <UserRound className="h-4 w-4" />
              Cliente
            </TabsTrigger>
            <TabsTrigger value="freelancer" className="flex items-center gap-2">
              <BriefcaseBusiness className="h-4 w-4" />
              Profissional
            </TabsTrigger>
          </TabsList>

          <TabsContent value="client">
            <Card>
              <CardHeader>
                <CardTitle>Registrar como Cliente</CardTitle>
                <CardDescription>
                  Crie uma conta para encontrar profissionais qualificados
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleClientSubmit}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="client-name">Nome completo</Label>
                      <Input 
                        id="client-name" 
                        value={clientData.name}
                        onChange={(e) => handleClientChange('name', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client-phone">Telefone</Label>
                      <Input 
                        id="client-phone" 
                        type="tel" 
                        placeholder="(00) 00000-0000"
                        value={clientData.phone}
                        onChange={(e) => handleClientChange('phone', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="client-email">Email</Label>
                    <Input 
                      id="client-email" 
                      type="email" 
                      placeholder="seu@email.com" 
                      value={clientData.email}
                      onChange={(e) => handleClientChange('email', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="client-password">Senha</Label>
                      <Input 
                        id="client-password" 
                        type="password" 
                        value={clientData.password}
                        onChange={(e) => handleClientChange('password', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client-confirm-password">Confirmar senha</Label>
                      <Input 
                        id="client-confirm-password" 
                        type="password" 
                        value={clientData.confirmPassword}
                        onChange={(e) => handleClientChange('confirmPassword', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="client-terms" 
                      checked={clientData.acceptTerms}
                      onCheckedChange={(checked) => 
                        handleClientChange('acceptTerms', checked === true)
                      }
                    />
                    <label
                      htmlFor="client-terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Aceito os termos de uso e política de privacidade
                    </label>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full bg-helpaqui-blue"
                    disabled={isLoading}
                  >
                    {isLoading ? "Criando conta..." : "Criar conta de cliente"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="freelancer">
            <Card>
              <CardHeader>
                <CardTitle>Registrar como Profissional</CardTitle>
                <CardDescription>
                  Crie uma conta para oferecer seus serviços na plataforma
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleFreelancerSubmit}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="freelancer-name">Nome completo</Label>
                      <Input 
                        id="freelancer-name" 
                        value={freelancerData.name}
                        onChange={(e) => handleFreelancerChange('name', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="freelancer-phone">Telefone</Label>
                      <Input 
                        id="freelancer-phone" 
                        type="tel" 
                        placeholder="(00) 00000-0000"
                        value={freelancerData.phone}
                        onChange={(e) => handleFreelancerChange('phone', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="freelancer-email">Email</Label>
                    <Input 
                      id="freelancer-email" 
                      type="email" 
                      placeholder="seu@email.com" 
                      value={freelancerData.email}
                      onChange={(e) => handleFreelancerChange('email', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="freelancer-document">CPF ou CNPJ</Label>
                    <Input 
                      id="freelancer-document" 
                      placeholder="000.000.000-00"
                      value={freelancerData.document}
                      onChange={(e) => handleFreelancerChange('document', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Categorias de serviço</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {serviceCategories.map(category => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`category-${category.id}`} 
                            checked={freelancerData.categories.includes(category.id)}
                            onCheckedChange={() => toggleCategory(category.id)}
                          />
                          <label
                            htmlFor={`category-${category.id}`}
                            className="text-sm font-medium leading-none"
                          >
                            {category.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="freelancer-description">Descrição do seu trabalho</Label>
                    <textarea 
                      id="freelancer-description" 
                      className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Descreva brevemente sua experiência e os serviços que oferece"
                      value={freelancerData.description}
                      onChange={(e) => handleFreelancerChange('description', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="p-4 border rounded bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Upload className="h-4 w-4 text-helpaqui-blue" />
                      <Label>Upload de documentos</Label>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      Envie documentos para verificação (RG/CNH, comprovante de residência, certificados)
                    </p>
                    <Input 
                      type="file" 
                      className="cursor-pointer"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="freelancer-password">Senha</Label>
                      <Input 
                        id="freelancer-password" 
                        type="password" 
                        value={freelancerData.password}
                        onChange={(e) => handleFreelancerChange('password', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="freelancer-confirm-password">Confirmar senha</Label>
                      <Input 
                        id="freelancer-confirm-password" 
                        type="password" 
                        value={freelancerData.confirmPassword}
                        onChange={(e) => handleFreelancerChange('confirmPassword', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="freelancer-terms" 
                      checked={freelancerData.acceptTerms}
                      onCheckedChange={(checked) => 
                        handleFreelancerChange('acceptTerms', checked === true)
                      }
                    />
                    <label
                      htmlFor="freelancer-terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Aceito os termos de uso e política de privacidade
                    </label>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full bg-helpaqui-green"
                    disabled={isLoading}
                  >
                    {isLoading ? "Criando conta..." : "Criar conta de profissional"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Register;
