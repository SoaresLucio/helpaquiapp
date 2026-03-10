
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BriefcaseBusiness, UserRound, AlertCircle, LockIcon, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { signIn, signUp } from '@/services/authService';
import { supabase } from "@/integrations/supabase/client";

interface FormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface ValidationState {
  length: boolean;
  hasNumber: boolean;
  hasLetter: boolean;
}

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('login');
  const [validations, setValidations] = useState<ValidationState>({
    length: false,
    hasNumber: false,
    hasLetter: false
  });
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) navigate('/');
    };
    checkUser();
  }, [navigate]);

  useEffect(() => {
    setValidations({
      length: formData.password.length >= 6,
      hasNumber: /\d/.test(formData.password),
      hasLetter: /[a-zA-Z]/.test(formData.password)
    });
  }, [formData.password]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    setEmailError(isValid ? null : "Email inválido");
    return isValid;
  };

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'email' && value) validateEmail(value);
  };

  const handleSubmit = async (e: React.FormEvent, isSignUp: boolean) => {
    e.preventDefault();
    
    if (!validateEmail(formData.email)) return;
    
    if (isSignUp) {
      if (!formData.firstName || !formData.lastName) {
        setError("Nome e sobrenome são obrigatórios");
        return;
      }
      
      if (!validations.length || !validations.hasNumber || !validations.hasLetter) {
        setError("A senha não atende aos requisitos mínimos");
        return;
      }
    }
    
    setLoading(true);
    setError(null);
    
    try {
      if (isSignUp) {
        const { session } = await signUp(formData.email, formData.password, formData.firstName, formData.lastName, 'solicitante');
        
        toast({
          title: "Cadastro realizado",
          description: session 
            ? "Conta criada com sucesso!" 
            : "Verifique seu e-mail para confirmar seu cadastro."
        });
        
        if (session) {
          navigate('/');
        } else {
          setActiveTab('login');
          toast({
            title: "Confirmação necessária",
            description: "Enviamos um email de confirmação. Por favor, verifique sua caixa de entrada."
          });
        }
      } else {
        await signIn(formData.email, formData.password);
        
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo de volta!"
        });
        
        navigate('/');
      }
    } catch (error: any) {
      console.error(`Erro de ${isSignUp ? 'cadastro' : 'login'}:`, error);
      setError(error.message || `Erro ao ${isSignUp ? 'criar conta' : 'fazer login'}. Verifique os dados e tente novamente.`);
      toast({
        title: `Erro no ${isSignUp ? 'cadastro' : 'login'}`,
        description: error.message || "Ocorreu um erro",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const ValidationIcon = ({ isValid }: { isValid: boolean }) => (
    <div className={`w-4 h-4 mr-2 rounded-full flex items-center justify-center ${isValid ? 'bg-helpaqui-green' : 'bg-muted'}`}>
      {isValid && <Check className="h-3 w-3 text-primary-foreground" />}
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-helpaqui-blue">
          Help<span className="text-helpaqui-green">Aqui</span>
        </h1>
        <p className="text-muted-foreground mt-2">Freelancers profissionais perto de você</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md">
        <TabsList className="grid grid-cols-2 mb-8">
          <TabsTrigger value="login" className="flex items-center gap-2">
            <UserRound className="h-4 w-4" />
            Login
          </TabsTrigger>
          <TabsTrigger value="signup" className="flex items-center gap-2">
            <BriefcaseBusiness className="h-4 w-4" />
            Cadastro
          </TabsTrigger>
        </TabsList>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Entrar</CardTitle>
              <CardDescription>Acesse sua conta HelpAqui</CardDescription>
            </CardHeader>
            <form onSubmit={(e) => handleSubmit(e, false)}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="seu@email.com" 
                    value={formData.email} 
                    onChange={e => updateFormData('email', e.target.value)}
                    className={emailError ? "border-destructive" : ""}
                    required 
                  />
                  {emailError && <p className="text-xs text-destructive">{emailError}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type="password" 
                      value={formData.password} 
                      onChange={e => updateFormData('password', e.target.value)}
                      required 
                    />
                    <LockIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Cadastro</CardTitle>
              <CardDescription>Crie sua conta para usar o HelpAqui</CardDescription>
            </CardHeader>
            <form onSubmit={(e) => handleSubmit(e, true)}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input 
                    id="signup-email" 
                    type="email" 
                    placeholder="seu@email.com" 
                    value={formData.email} 
                    onChange={e => updateFormData('email', e.target.value)}
                    className={emailError ? "border-destructive" : ""}
                    required 
                  />
                  {emailError && <p className="text-xs text-destructive">{emailError}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="first-name">Nome</Label>
                  <Input 
                    id="first-name" 
                    type="text" 
                    placeholder="Seu nome" 
                    value={formData.firstName} 
                    onChange={e => updateFormData('firstName', e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Sobrenome</Label>
                  <Input 
                    id="last-name" 
                    type="text" 
                    placeholder="Seu sobrenome" 
                    value={formData.lastName} 
                    onChange={e => updateFormData('lastName', e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <Input 
                    id="signup-password" 
                    type="password" 
                    value={formData.password} 
                    onChange={e => updateFormData('password', e.target.value)}
                    required 
                    className={!validations.length ? "border-red-300" : ""}
                  />
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center">
                      <ValidationIcon isValid={validations.length} />
                      <span className="text-xs text-gray-600">Pelo menos 6 caracteres</span>
                    </div>
                    <div className="flex items-center">
                      <ValidationIcon isValid={validations.hasNumber} />
                      <span className="text-xs text-gray-600">Pelo menos um número</span>
                    </div>
                    <div className="flex items-center">
                      <ValidationIcon isValid={validations.hasLetter} />
                      <span className="text-xs text-gray-600">Pelo menos uma letra</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || !validations.length || !validations.hasNumber || !validations.hasLetter || !formData.firstName || !formData.lastName || !formData.email || !!emailError}
                >
                  {loading ? "Cadastrando..." : "Cadastrar"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Auth;
