
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BriefcaseBusiness, UserRound, ArrowLeft, Upload, FileText, ScrollText, Facebook, Instagram } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { serviceCategories } from '@/data/mockData';
import { GoogleLogin } from '@react-oauth/google';
import { Separator } from '@/components/ui/separator';
import PrivacyPolicyDialog from '@/components/PrivacyPolicyDialog';
import TermsOfUseDialog from '@/components/TermsOfUseDialog';

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
    birthdate: '',
    acceptTerms: false,
    termsRead: {
      privacy: false,
      terms: false
    }
  });
  
  const [freelancerData, setFreelancerData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    birthdate: '',
    document: '',
    categories: [] as string[],
    description: '',
    acceptTerms: false,
    termsRead: {
      privacy: false,
      terms: false
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);
  const [currentUserType, setCurrentUserType] = useState<'client' | 'freelancer'>('client');

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
    
    if (!clientData.termsRead.privacy || !clientData.termsRead.terms) {
      toast({
        title: "Erro",
        description: "Você precisa ler e aceitar os termos de uso e política de privacidade",
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
    
    if (!freelancerData.termsRead.privacy || !freelancerData.termsRead.terms) {
      toast({
        title: "Erro",
        description: "Você precisa ler e aceitar os termos de uso e política de privacidade",
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

  const handleSocialSignup = (provider: string, userType: 'client' | 'freelancer', userData?: any) => {
    setIsLoading(true);
    
    // Data that would typically come from social login provider
    const mockSocialData = {
      name: userData?.name || `Usuário ${provider}`,
      email: userData?.email || `user@${provider.toLowerCase()}.com`,
    };
    
    if (userType === 'client') {
      setClientData(prev => ({
        ...prev,
        name: mockSocialData.name,
        email: mockSocialData.email,
      }));
    } else {
      setFreelancerData(prev => ({
        ...prev,
        name: mockSocialData.name,
        email: mockSocialData.email,
      }));
    }
    
    toast({
      title: `Autenticação com ${provider} bem-sucedida`,
      description: "Complete seu cadastro com os dados adicionais",
    });
    
    setIsLoading(false);
  };

  const handleGoogleSignup = (credentialResponse: any) => {
    // In a real app, you would decode the credential and extract user info
    const userType = document.querySelector('[aria-selected="true"]')?.getAttribute('value') as 'client' | 'freelancer' || 'client';
    
    // Mock data - in a real scenario, you'd decode the credential response
    const userData = {
      name: "Usuário Google",
      email: "user@gmail.com"
    };
    
    handleSocialSignup('Google', userType, userData);
  };

  const openPrivacyPolicy = (userType: 'client' | 'freelancer') => {
    setCurrentUserType(userType);
    setPrivacyDialogOpen(true);
  };

  const openTermsOfUse = (userType: 'client' | 'freelancer') => {
    setCurrentUserType(userType);
    setTermsDialogOpen(true);
  };

  const handlePrivacyPolicyAccept = () => {
    if (currentUserType === 'client') {
      setClientData(prev => ({
        ...prev,
        termsRead: { ...prev.termsRead, privacy: true }
      }));
    } else {
      setFreelancerData(prev => ({
        ...prev,
        termsRead: { ...prev.termsRead, privacy: true }
      }));
    }
    setPrivacyDialogOpen(false);
  };

  const handleTermsOfUseAccept = () => {
    if (currentUserType === 'client') {
      setClientData(prev => ({
        ...prev,
        termsRead: { ...prev.termsRead, terms: true }
      }));
    } else {
      setFreelancerData(prev => ({
        ...prev,
        termsRead: { ...prev.termsRead, terms: true }
      }));
    }
    setTermsDialogOpen(false);
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
              
              <div className="px-6 pb-2">
                <div className="relative w-full mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-card px-2 text-xs text-muted-foreground">cadastre-se com</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSignup}
                      onError={() => {
                        console.log('Signup Failed');
                        toast({
                          title: "Erro no cadastro",
                          description: "Falha ao cadastrar com Google",
                          variant: "destructive",
                        });
                      }}
                      useOneTap
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    className="flex items-center justify-center gap-2" 
                    onClick={() => handleSocialSignup('Facebook', 'client')}
                    disabled={isLoading}
                  >
                    <Facebook className="h-4 w-4 text-blue-600" />
                    Facebook
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center justify-center gap-2" 
                    onClick={() => handleSocialSignup('Instagram', 'client')}
                    disabled={isLoading}
                  >
                    <Instagram className="h-4 w-4 text-pink-600" />
                    Instagram
                  </Button>
                </div>
                
                <div className="relative w-full mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-card px-2 text-xs text-muted-foreground">ou preencha o formulário</span>
                  </div>
                </div>
              </div>
              
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="client-birthdate">Data de nascimento</Label>
                    <Input 
                      id="client-birthdate" 
                      type="date" 
                      value={clientData.birthdate}
                      onChange={(e) => handleClientChange('birthdate', e.target.value)}
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
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => openPrivacyPolicy('client')}
                        className="text-xs flex items-center"
                      >
                        <ScrollText className="mr-2 h-4 w-4" />
                        Ler política de privacidade
                      </Button>
                      {clientData.termsRead.privacy && <span className="text-xs text-green-600">✓ Lido</span>}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => openTermsOfUse('client')}
                        className="text-xs flex items-center"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Ler termos de uso
                      </Button>
                      {clientData.termsRead.terms && <span className="text-xs text-green-600">✓ Lido</span>}
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
                    disabled={isLoading || !clientData.termsRead.privacy || !clientData.termsRead.terms || !clientData.acceptTerms}
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
              
              <div className="px-6 pb-2">
                <div className="relative w-full mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-card px-2 text-xs text-muted-foreground">cadastre-se com</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSignup}
                      onError={() => {
                        console.log('Signup Failed');
                        toast({
                          title: "Erro no cadastro",
                          description: "Falha ao cadastrar com Google",
                          variant: "destructive",
                        });
                      }}
                      useOneTap
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    className="flex items-center justify-center gap-2" 
                    onClick={() => handleSocialSignup('Facebook', 'freelancer')}
                    disabled={isLoading}
                  >
                    <Facebook className="h-4 w-4 text-blue-600" />
                    Facebook
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center justify-center gap-2" 
                    onClick={() => handleSocialSignup('Instagram', 'freelancer')}
                    disabled={isLoading}
                  >
                    <Instagram className="h-4 w-4 text-pink-600" />
                    Instagram
                  </Button>
                </div>
                
                <div className="relative w-full mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-card px-2 text-xs text-muted-foreground">ou preencha o formulário</span>
                  </div>
                </div>
              </div>
              
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="freelancer-birthdate">Data de nascimento</Label>
                      <Input 
                        id="freelancer-birthdate" 
                        type="date" 
                        value={freelancerData.birthdate}
                        onChange={(e) => handleFreelancerChange('birthdate', e.target.value)}
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
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => openPrivacyPolicy('freelancer')}
                        className="text-xs flex items-center"
                      >
                        <ScrollText className="mr-2 h-4 w-4" />
                        Ler política de privacidade
                      </Button>
                      {freelancerData.termsRead.privacy && <span className="text-xs text-green-600">✓ Lido</span>}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => openTermsOfUse('freelancer')}
                        className="text-xs flex items-center"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Ler termos de uso
                      </Button>
                      {freelancerData.termsRead.terms && <span className="text-xs text-green-600">✓ Lido</span>}
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
                    disabled={isLoading || !freelancerData.termsRead.privacy || !freelancerData.termsRead.terms || !freelancerData.acceptTerms}
                  >
                    {isLoading ? "Criando conta..." : "Criar conta de profissional"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <PrivacyPolicyDialog 
        open={privacyDialogOpen} 
        onOpenChange={setPrivacyDialogOpen}
        onAccept={handlePrivacyPolicyAccept}
      />
      
      <TermsOfUseDialog 
        open={termsDialogOpen} 
        onOpenChange={setTermsDialogOpen}
        onAccept={handleTermsOfUseAccept}
      />
    </div>
  );
};

export default Register;
