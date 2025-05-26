
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BriefcaseBusiness, UserRound } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { signIn, signInWithGoogle } from '@/services/authService';

// Google Icon component
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [solicitanteEmail, setSolicitanteEmail] = useState('');
  const [solicitantePassword, setSolicitantePassword] = useState('');
  const [freelancerEmail, setFreelancerEmail] = useState('');
  const [freelancerPassword, setFreelancerPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const handleSolicitanteLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signIn(solicitanteEmail, solicitantePassword);
      
      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo de volta ao HelpAqui!"
      });
      
      navigate('/');
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Email ou senha incorretos. Por favor, tente novamente.";
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
      await signIn(freelancerEmail, freelancerPassword);
      
      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo de volta ao HelpAqui!"
      });
      
      navigate('/');
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Email ou senha incorretos. Por favor, tente novamente.";
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

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      // O redirecionamento será tratado automaticamente pelo Supabase
    } catch (error) {
      console.error("Google login error:", error);
      toast({
        title: "Erro no login",
        description: error instanceof Error ? error.message : "Falha ao entrar com Google",
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-helpaqui-blue">
          Help<span className="text-helpaqui-green">Aqui</span>
        </h1>
        <p className="text-gray-600 mt-2">Freelancers profissionais perto de você, solução rápida onde estiver!</p>
      </div>

      <Tabs defaultValue="solicitante" className="w-full max-w-md">
        <TabsList className="grid grid-cols-2 mb-8">
          <TabsTrigger value="solicitante" className="flex items-center gap-2">
            <UserRound className="h-4 w-4" />
            Solicitante
          </TabsTrigger>
          <TabsTrigger value="freelancer" className="flex items-center gap-2">
            <BriefcaseBusiness className="h-4 w-4" />
            Freelancer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="solicitante">
          <Card>
            <CardHeader>
              <CardTitle>Entrar como Solicitante</CardTitle>
              <CardDescription>
                Precisa encontrar freelancers qualificados para seus projetos
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSolicitanteLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="solicitante-email">Email</Label>
                  <Input 
                    id="solicitante-email" 
                    type="email" 
                    placeholder="seu@email.com" 
                    value={solicitanteEmail} 
                    onChange={e => setSolicitanteEmail(e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="solicitante-password">Senha</Label>
                  <Input 
                    id="solicitante-password" 
                    type="password" 
                    placeholder="Digite sua senha"
                    value={solicitantePassword} 
                    onChange={e => setSolicitantePassword(e.target.value)} 
                    required 
                  />
                  <div className="flex justify-end">
                    <Button variant="link" size="sm" className="text-xs p-0" onClick={() => navigate('/reset-password')}>
                      Esqueci minha senha
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col space-y-4">
                <Button type="submit" className="w-full bg-helpaqui-blue" disabled={isLoading}>
                  {isLoading ? "Entrando..." : "Entrar como Solicitante"}
                </Button>
                
                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-card px-2 text-xs text-muted-foreground">ou continue com</span>
                  </div>
                </div>
                
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full flex items-center gap-2"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                >
                  <GoogleIcon />
                  {googleLoading ? "Entrando..." : "Entrar com Google"}
                </Button>
                
                <div className="text-sm text-center">
                  <span className="text-gray-600">Novo por aqui? </span>
                  <Button variant="link" className="p-0" onClick={() => navigate('/register?type=solicitante')}>
                    Criar conta de solicitante
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="freelancer">
          <Card>
            <CardHeader>
              <CardTitle>Entrar como Freelancer</CardTitle>
              <CardDescription>
                Ofereça seus serviços e encontre novas oportunidades
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleFreelancerLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="freelancer-email">Email</Label>
                  <Input 
                    id="freelancer-email" 
                    type="email" 
                    placeholder="seu@email.com" 
                    value={freelancerEmail} 
                    onChange={e => setFreelancerEmail(e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="freelancer-password">Senha</Label>
                  <Input 
                    id="freelancer-password" 
                    type="password" 
                    placeholder="Digite sua senha"
                    value={freelancerPassword} 
                    onChange={e => setFreelancerPassword(e.target.value)} 
                    required 
                  />
                  <div className="flex justify-end">
                    <Button variant="link" size="sm" className="text-xs p-0" onClick={() => navigate('/reset-password')}>
                      Esqueci minha senha
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col space-y-4">
                <Button type="submit" className="w-full bg-helpaqui-green" disabled={isLoading}>
                  {isLoading ? "Entrando..." : "Entrar como Freelancer"}
                </Button>
                
                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-card px-2 text-xs text-muted-foreground">ou continue com</span>
                  </div>
                </div>
                
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full flex items-center gap-2"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                >
                  <GoogleIcon />
                  {googleLoading ? "Entrando..." : "Entrar com Google"}
                </Button>
                
                <div className="text-sm text-center">
                  <span className="text-gray-600">Quer trabalhar conosco? </span>
                  <Button variant="link" className="p-0" onClick={() => navigate('/register?type=freelancer')}>
                    Cadastre-se como freelancer
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Login;
