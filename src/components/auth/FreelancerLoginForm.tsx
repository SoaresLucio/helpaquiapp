
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { signIn, signInWithGoogle } from '@/services/authService';
import { handlePostLoginRedirect } from '@/services/loginRedirectService';
import GoogleIcon from './GoogleIcon';

interface FreelancerLoginFormProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  googleLoading: boolean;
  setGoogleLoading: (loading: boolean) => void;
}

const FreelancerLoginForm: React.FC<FreelancerLoginFormProps> = ({
  isLoading,
  setIsLoading,
  googleLoading,
  setGoogleLoading
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signIn(email, password);
      
      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo de volta ao HelpAqui!"
      });
      
      // Aguarda um pouco para o estado de autenticação ser atualizado
      setTimeout(async () => {
        const redirectPath = await handlePostLoginRedirect();
        navigate(redirectPath, { replace: true });
      }, 1000);
      
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
      // O redirecionamento será tratado pelo hook useAuth
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
    <Card>
      <CardHeader>
        <CardTitle>Entrar como Freelancer</CardTitle>
        <CardDescription>
          Ofereça seus serviços e encontre novas oportunidades
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="freelancer-email">Email</Label>
            <Input 
              id="freelancer-email" 
              type="email" 
              placeholder="seu@email.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="freelancer-password">Senha</Label>
            <Input 
              id="freelancer-password" 
              type="password" 
              placeholder="Digite sua senha"
              value={password} 
              onChange={e => setPassword(e.target.value)} 
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
  );
};

export default FreelancerLoginForm;
