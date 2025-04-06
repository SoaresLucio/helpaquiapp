import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BriefcaseBusiness, UserRound, ArrowRight, FileText, Building, WalletCards, ListChecks } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { GoogleLogin } from '@react-oauth/google';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { signIn, resetPassword } from '@/services/authService';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const PasswordResetDialog = () => {
  const [resetPasswordEmail, setResetPasswordEmail] = useState('');
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const { toast } = useToast();

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetPasswordEmail || !resetPasswordEmail.includes('@')) {
      toast({
        title: "Erro",
        description: "Por favor, insira um endereço de e-mail válido",
        variant: "destructive"
      });
      return;
    }
    
    setIsResettingPassword(true);
    
    try {
      await resetPassword(resetPasswordEmail);
      
      toast({
        title: "E-mail enviado",
        description: "Verifique seu e-mail para redefinir sua senha"
      });
      
      setIsResetDialogOpen(false);
      setResetPasswordEmail('');
    } catch (error) {
      console.error("Error resetting password:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao enviar e-mail de redefinição de senha",
        variant: "destructive"
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Resetar senha</DialogTitle>
          <DialogDescription>
            Insira seu e-mail para receber um link de redefinição de senha.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handlePasswordReset}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">E-mail</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="seu@email.com"
                value={resetPasswordEmail}
                onChange={(e) => setResetPasswordEmail(e.target.value)}
                required
              />
            </div>
            <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Um link para redefinição de senha será enviado para seu e-mail cadastrado.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsResetDialogOpen(false)}
              disabled={isResettingPassword}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={isResettingPassword}
            >
              {isResettingPassword ? "Enviando..." : "Enviar link de redefinição"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clientEmail, setClientEmail] = useState('');
  const [clientPassword, setClientPassword] = useState('');
  const [freelancerEmail, setFreelancerEmail] = useState('');
  const [freelancerPassword, setFreelancerPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isClientOptionsOpen, setIsClientOptionsOpen] = useState(false);
  const [isFreelancerOptionsOpen, setIsFreelancerOptionsOpen] = useState(false);
  
  // Password reset
  const [resetPasswordEmail, setResetPasswordEmail] = useState('');
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const handleClientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await signIn(clientEmail, clientPassword);
      
      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo de volta ao HelpAqui!"
      });
      
      navigate('/');
    } catch (error) {
      let errorMessage = "Erro ao fazer login. Tente novamente.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFreelancerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await signIn(freelancerEmail, freelancerPassword);
      
      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo de volta ao HelpAqui!"
      });
      
      navigate('/');
    } catch (error) {
      let errorMessage = "Erro ao fazer login. Tente novamente.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = (credentialResponse: any) => {
    // In a real app, you would verify the credential with your backend
    console.log("Google login successful:", credentialResponse);
    
    // For demonstration, we're using the active tab to determine user type
    const userType = document.querySelector('[aria-selected="true"]')?.getAttribute('value') || 'client';
    
    localStorage.setItem('userType', userType);
    localStorage.setItem('userEmail', 'user@google.com');
    
    toast({
      title: "Login Google bem-sucedido",
      description: "Bem-vindo ao HelpAqui!"
    });
    
    navigate('/');
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetPasswordEmail || !resetPasswordEmail.includes('@')) {
      toast({
        title: "Erro",
        description: "Por favor, insira um endereço de e-mail válido",
        variant: "destructive"
      });
      return;
    }
    
    setIsResettingPassword(true);
    
    try {
      await resetPassword(resetPasswordEmail);
      
      toast({
        title: "E-mail enviado",
        description: "Verifique seu e-mail para redefinir sua senha"
      });
      
      setIsResetDialogOpen(false);
      setResetPasswordEmail('');
    } catch (error) {
      console.error("Error resetting password:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao enviar e-mail de redefinição de senha",
        variant: "destructive"
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleServiceRequest = () => {
    toast({
      title: "Solicitação de serviço",
      description: "Funcionalidade de solicitação de serviço em desenvolvimento"
    });
  };

  const handlePublishService = () => {
    toast({
      title: "Publicação de serviço",
      description: "Funcionalidade de publicação de serviço em desenvolvimento"
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-helpaqui-blue">
          Help<span className="text-helpaqui-green">Aqui</span>
        </h1>
        <p className="text-gray-600 mt-2">Freelancers profissionais perto de você, solução rápida onde estiver!</p>
      </div>

      <Tabs defaultValue="client" className="w-full max-w-md">
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
              <CardTitle>Entrar como Cliente</CardTitle>
              <CardDescription>
                Precisa encontrar profissionais qualificados para seus projetos
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleClientLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="client-email">Email</Label>
                  <Input id="client-email" type="email" placeholder="seu@email.com" value={clientEmail} onChange={e => setClientEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-password">Senha</Label>
                  <Input id="client-password" type="password" value={clientPassword} onChange={e => setClientPassword(e.target.value)} required />
                  <div className="flex justify-end">
                    <Button variant="link" size="sm" className="text-xs p-0" onClick={() => setIsResetDialogOpen(true)}>
                      Esqueci minha senha
                    </Button>
                  </div>
                </div>

                <Collapsible 
                  open={isClientOptionsOpen} 
                  onOpenChange={setIsClientOptionsOpen}
                  className="border rounded-md p-2"
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <ListChecks className="h-4 w-4 text-helpaqui-blue" />
                      Opções para Clientes
                    </div>
                    <ArrowRight className={`h-4 w-4 transition-transform ${isClientOptionsOpen ? 'rotate-90' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3 space-y-2">
                    <div className="border-l-2 border-helpaqui-blue pl-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full flex items-center justify-start gap-2" 
                        onClick={handleServiceRequest}
                      >
                        <FileText className="h-4 w-4 text-helpaqui-blue" />
                        Solicitar Freelancer para serviço
                      </Button>
                    </div>
                    <div className="border-l-2 border-helpaqui-green pl-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full flex items-center justify-start gap-2" 
                        onClick={() => navigate('/payments')}
                      >
                        <WalletCards className="h-4 w-4 text-helpaqui-green" />
                        Métodos de Pagamento
                      </Button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
              <CardFooter className="flex-col space-y-4">
                <Button type="submit" className="w-full bg-helpaqui-blue" disabled={isLoading}>
                  {isLoading ? "Entrando..." : "Entrar como Cliente"}
                </Button>
                
                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-card px-2 text-xs text-muted-foreground">ou continue com</span>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() => {
                      console.log('Login Failed');
                      toast({
                        title: "Erro no login",
                        description: "Falha ao entrar com Google",
                        variant: "destructive",
                      });
                    }}
                    useOneTap
                  />
                </div>
                
                <div className="text-sm text-center">
                  <span className="text-gray-600">Novo por aqui? </span>
                  <Button variant="link" className="p-0" onClick={() => navigate('/register?type=client')}>
                    Criar conta de cliente
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="freelancer">
          <Card>
            <CardHeader>
              <CardTitle>Entrar como Profissional</CardTitle>
              <CardDescription>
                Ofereça seus serviços e encontre novas oportunidades
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleFreelancerLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="freelancer-email">Email</Label>
                  <Input id="freelancer-email" type="email" placeholder="seu@email.com" value={freelancerEmail} onChange={e => setFreelancerEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="freelancer-password">Senha</Label>
                  <Input id="freelancer-password" type="password" value={freelancerPassword} onChange={e => setFreelancerPassword(e.target.value)} required />
                  <div className="flex justify-end">
                    <Button variant="link" size="sm" className="text-xs p-0" onClick={() => setIsResetDialogOpen(true)}>
                      Esqueci minha senha
                    </Button>
                  </div>
                </div>

                <Collapsible 
                  open={isFreelancerOptionsOpen} 
                  onOpenChange={setIsFreelancerOptionsOpen}
                  className="border rounded-md p-2"
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <ListChecks className="h-4 w-4 text-helpaqui-green" />
                      Opções para Profissionais
                    </div>
                    <ArrowRight className={`h-4 w-4 transition-transform ${isFreelancerOptionsOpen ? 'rotate-90' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3 space-y-2">
                    <div className="border-l-2 border-helpaqui-blue pl-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full flex items-center justify-start gap-2" 
                        onClick={handlePublishService}
                      >
                        <FileText className="h-4 w-4 text-helpaqui-blue" />
                        Publicar prestação de serviço
                      </Button>
                    </div>
                    <div className="border-l-2 border-helpaqui-green pl-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full flex items-center justify-start gap-2" 
                        onClick={() => navigate('/payments')}
                      >
                        <Building className="h-4 w-4 text-helpaqui-green" />
                        Dados bancários
                      </Button>
                      <p className="text-xs text-gray-500 mt-1 ml-1">
                        Saque mínimo: R$10,00 • Taxa de serviço: 10%
                      </p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
              <CardFooter className="flex-col space-y-4">
                <Button type="submit" className="w-full bg-helpaqui-green" disabled={isLoading}>
                  {isLoading ? "Entrando..." : "Entrar como Profissional"}
                </Button>
                
                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-card px-2 text-xs text-muted-foreground">ou continue com</span>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() => {
                      console.log('Login Failed');
                      toast({
                        title: "Erro no login",
                        description: "Falha ao entrar com Google",
                        variant: "destructive",
                      });
                    }}
                    useOneTap
                  />
                </div>
                
                <div className="text-sm text-center">
                  <span className="text-gray-600">Quer trabalhar conosco? </span>
                  <Button variant="link" className="p-0" onClick={() => navigate('/register?type=freelancer')}>
                    Cadastre-se como profissional
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>

      <PasswordResetDialog />
    </div>
  );
};

export default Login;
