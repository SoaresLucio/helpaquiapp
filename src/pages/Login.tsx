import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BriefcaseBusiness, UserRound, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
const Login = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
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
  return <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
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
    </div>;
};
export default Login;