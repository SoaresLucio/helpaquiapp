import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BriefcaseBusiness, UserRound, ArrowLeft, Upload, FileText, ScrollText, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { serviceCategories } from '@/data/mockData';
import { GoogleLogin } from '@react-oauth/google';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PrivacyPolicyDialog from '@/components/PrivacyPolicyDialog';
import TermsOfUseDialog from '@/components/TermsOfUseDialog';
import { signUp, signInWithGoogle } from '@/services/authService';
import { differenceInYears, parse } from 'date-fns';

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
    categories: [] as string[],
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

  const validateAge = (birthdate: string): boolean => {
    if (!birthdate) return false;
    
    try {
      const parsedDate = parse(birthdate, 'yyyy-MM-dd', new Date());
      const age = differenceInYears(new Date(), parsedDate);
      return age >= 18;
    } catch {
      return false;
    }
  };
  
  const validatePassword = (password: string): boolean => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
  };

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAge(clientData.birthdate)) {
      toast({
        title: "Erro",
        description: "Você deve ter pelo menos 18 anos para se cadastrar",
        variant: "destructive",
      });
      return;
    }
    
    if (!validatePassword(clientData.password)) {
      toast({
        title: "Erro",
        description: "A senha deve conter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas e números",
        variant: "destructive",
      });
      return;
    }

    if (clientData.password !== clientData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }
    
    if (!clientData.acceptTerms || !clientData.termsRead.privacy || !clientData.termsRead.terms) {
      toast({
        title: "Erro",
        description: "Você precisa ler e aceitar os termos de uso e política de privacidade",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    const [firstName, ...lastNameParts] = clientData.name.split(' ');
    const lastName = lastNameParts.join(' ');
    
    try {
      await signUp(clientData.email, clientData.password, firstName, lastName, 'solicitante');
      
      toast({
        title: "Registro bem-sucedido",
        description: "Bem-vindo ao HelpAqui! Verifique seu email para confirmar sua conta.",
      });
      
      navigate('/login');
    } catch (error: any) {
      let errorMessage = "Erro ao criar sua conta.";
      
      if (error.message.includes("já está registrado")) {
        errorMessage = "Este email já foi cadastrado.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro no registro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFreelancerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAge(freelancerData.birthdate)) {
      toast({
        title: "Erro",
        description: "Você deve ter pelo menos 18 anos para se cadastrar",
        variant: "destructive",
      });
      return;
    }

    if (!validatePassword(freelancerData.password)) {
      toast({
        title: "Erro",
        description: "A senha deve conter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas e números",
        variant: "destructive",
      });
      return;
    }
    
    if (freelancerData.password !== freelancerData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }
    
    if (!freelancerData.acceptTerms || !freelancerData.termsRead.privacy || !freelancerData.termsRead.terms) {
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
    
    const [firstName, ...lastNameParts] = freelancerData.name.split(' ');
    const lastName = lastNameParts.join(' ');
    
    try {
      await signUp(freelancerData.email, freelancerData.password, firstName, lastName, 'freelancer', freelancerData.categories);
      
      toast({
        title: "Registro bem-sucedido",
        description: "Bem-vindo ao HelpAqui! Após confirmar seu email, você poderá completar sua verificação profissional.",
      });
      
      navigate('/login');
    } catch (error: any) {
      let errorMessage = "Erro ao criar sua conta.";
      
      if (error.message.includes("já está registrado")) {
        errorMessage = "Este email já foi cadastrado.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro no registro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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

  const handleGoogleSignup = async (credentialResponse: any, userType: 'client' | 'freelancer') => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      
      // Store user type in localStorage temporarily
      localStorage.setItem('userType', userType === 'client' ? 'solicitante' : 'freelancer');
      
      toast({
        title: "Autenticação com Google bem-sucedida",
        description: "Redirecionando para a página inicial...",
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Erro no cadastro com Google",
        description: error.message || "Falha ao cadastrar com Google",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
              Solicitante
            </TabsTrigger>
            <TabsTrigger value="freelancer" className="flex items-center gap-2">
              <BriefcaseBusiness className="h-4 w-4" />
              Freelancer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="client">
            <Card>
              <CardHeader>
                <CardTitle>Registrar como Solicitante</CardTitle>
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
                
                <div className="flex justify-center mb-4">
                  <GoogleLogin
                    onSuccess={(credentialResponse) => handleGoogleSignup(credentialResponse, 'client')}
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="client-birthdate">Data de nascimento</Label>
                    <Input 
                      id="client-birthdate" 
                      type="date" 
                      value={clientData.birthdate}
                      onChange={(e) => handleClientChange('birthdate', e.target.value)}
                      required
                    />
                    <p className="text-xs text-gray-500">Você deve ter pelo menos 18 anos</p>
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
                      <p className="text-xs text-gray-500">Mínimo de 8 caracteres, com letras maiúsculas, minúsculas e números</p>
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
                  
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-700">
                      Após criar sua conta, você receberá um email de confirmação. É necessário verificá-lo para ativar sua conta.
                    </AlertDescription>
                  </Alert>
                  
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
                    disabled={isLoading}
                  >
                    {isLoading ? "Criando conta..." : "Criar conta de solicitante"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="freelancer">
            <Card>
              <CardHeader>
                <CardTitle>Registrar como Freelancer</CardTitle>
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
                
                <div className="flex justify-center mb-4">
                  <GoogleLogin
                    onSuccess={(credentialResponse) => handleGoogleSignup(credentialResponse, 'freelancer')}
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="freelancer-birthdate">Data de nascimento</Label>
                    <Input 
                      id="freelancer-birthdate" 
                      type="date" 
                      value={freelancerData.birthdate}
                      onChange={(e) => handleFreelancerChange('birthdate', e.target.value)}
                      required
                    />
                    <p className="text-xs text-gray-500">Você deve ter pelo menos 18 anos</p>
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
                      <p className="text-xs text-gray-500">Mínimo de 8 caracteres, com letras maiúsculas, minúsculas e números</p>
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
                  
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-700">
                      Após criar sua conta, você receberá um email de confirmação. Em seguida, você deverá completar sua
                      verificação profissional enviando seus documentos na área de verificação de perfil.
                    </AlertDescription>
                  </Alert>
                  
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
                    disabled={isLoading}
                  >
                    {isLoading ? "Criando conta..." : "Criar conta de freelancer"}
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
