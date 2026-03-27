
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SecureInput } from '@/components/security/SecureInput';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Building2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { signIn, signInWithGoogle } from '@/services/authService';
import { validateEmail } from '@/utils/inputValidation';
import { useRateLimit } from '@/hooks/useRateLimit';
import GoogleIcon from './GoogleIcon';

interface EmpresaLoginFormProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  googleLoading: boolean;
  setGoogleLoading: (loading: boolean) => void;
}

const EmpresaLoginForm: React.FC<EmpresaLoginFormProps> = ({
  isLoading,
  setIsLoading,
  googleLoading,
  setGoogleLoading
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { checkRateLimit } = useRateLimit();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      toast({ title: "Erro de validação", description: emailValidation.errors[0], variant: "destructive" });
      return;
    }

    if (!password || password.length < 6) {
      toast({ title: "Erro de validação", description: "A senha deve ter pelo menos 6 caracteres", variant: "destructive" });
      return;
    }

    const isLimited = await checkRateLimit('login', 5, 60);
    if (isLimited) return;

    setIsLoading(true);
    try {
      await signIn(email, password);
      localStorage.setItem('userType', 'empresa');
      toast({ title: "Login bem-sucedido", description: "Bem-vindo de volta ao HelpAqui!" });
      navigate('/');
    } catch (error) {
      setLoginAttempts(prev => prev + 1);
      toast({
        title: "Erro no login",
        description: loginAttempts >= 3
          ? "Múltiplas tentativas falhadas. Sua conta pode ser temporariamente bloqueada."
          : "Credenciais inválidas. Verifique seu email e senha.",
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
    } catch (error) {
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
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <CardTitle>Entrar como Empresa</CardTitle>
        </div>
        <CardDescription>
          Gerencie vagas, divulgue sua empresa e encontre talentos
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="empresa-email">Email Corporativo</Label>
            <SecureInput 
              type="email" 
              placeholder="contato@empresa.com" 
              value={email} 
              onChange={setEmail}
              showSecurityIndicator
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="empresa-password">Senha</Label>
            <SecureInput 
              type="password" 
              placeholder="Digite sua senha"
              value={password} 
              onChange={setPassword}
              autoSanitize={false}
            />
            <div className="flex justify-end">
              <Button variant="link" size="sm" className="text-xs p-0" onClick={() => navigate('/reset-password')}>
                Esqueci minha senha
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar como Empresa"}
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
            <span className="text-muted-foreground">Ainda não tem conta? </span>
            <Button variant="link" className="p-0" onClick={() => navigate('/register?type=empresa')}>
              Cadastre sua empresa
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default EmpresaLoginForm;
