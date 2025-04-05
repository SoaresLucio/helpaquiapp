
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BriefcaseBusiness, UserRound, ArrowRight, Facebook, Instagram } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { GoogleLogin } from '@react-oauth/google';
import { Separator } from '@/components/ui/separator';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clientEmail, setClientEmail] = useState('');
  const [clientPassword, setClientPassword] = useState('');
  const [freelancerEmail, setFreelancerEmail] = useState('');
  const [freelancerPassword, setFreelancerPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login process
    setTimeout(() => {
      // In a real app, this would be an API call
      localStorage.setItem('userType', 'client');
      localStorage.setItem('userEmail', clientEmail);
      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo de volta ao HelpAqui!"
      });
      navigate('/');
      setIsLoading(false);
    }, 1000);
  };

  const handleFreelancerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login process
    setTimeout(() => {
      // In a real app, this would be an API call
      localStorage.setItem('userType', 'freelancer');
      localStorage.setItem('userEmail', freelancerEmail);
      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo de volta ao HelpAqui!"
      });
      navigate('/');
      setIsLoading(false);
    }, 1000);
  };

  const handleSocialLogin = (provider: string, userType: string) => {
    setIsLoading(true);
    
    // Simulate social login process
    setTimeout(() => {
      localStorage.setItem('userType', userType);
      localStorage.setItem('userEmail', `user@${provider.toLowerCase()}.com`);
      toast({
        title: "Login social bem-sucedido",
        description: `Bem-vindo ao HelpAqui via ${provider}!`
      });
      navigate('/');
      setIsLoading(false);
    }, 1000);
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
                </div>
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
                
                <div className="grid grid-cols-3 gap-2">
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
                  <Button 
                    variant="outline" 
                    className="flex items-center justify-center gap-2" 
                    onClick={() => handleSocialLogin('Facebook', 'client')}
                    disabled={isLoading}
                  >
                    <Facebook className="h-4 w-4 text-blue-600" />
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center justify-center gap-2" 
                    onClick={() => handleSocialLogin('Instagram', 'client')}
                    disabled={isLoading}
                  >
                    <Instagram className="h-4 w-4 text-pink-600" />
                  </Button>
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
                </div>
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
                
                <div className="grid grid-cols-3 gap-2">
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
                  <Button 
                    variant="outline" 
                    className="flex items-center justify-center gap-2" 
                    onClick={() => handleSocialLogin('Facebook', 'freelancer')}
                    disabled={isLoading}
                  >
                    <Facebook className="h-4 w-4 text-blue-600" />
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center justify-center gap-2" 
                    onClick={() => handleSocialLogin('Instagram', 'freelancer')}
                    disabled={isLoading}
                  >
                    <Instagram className="h-4 w-4 text-pink-600" />
                  </Button>
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
    </div>
  );
};

export default Login;
