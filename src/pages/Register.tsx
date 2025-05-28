
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BriefcaseBusiness, UserRound, AlertCircle, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { signUp } from '@/services/authService';
import { supabase } from "@/integrations/supabase/client";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(searchParams.get('type') || 'solicitante');
  const [validations, setValidations] = useState({
    length: false,
    hasNumber: false,
    hasLetter: false
  });
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar se o usuário já está autenticado
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkUser();
  }, [navigate]);

  // Password validation
  useEffect(() => {
    setValidations({
      length: password.length >= 6,
      hasNumber: /\d/.test(password),
      hasLetter: /[a-zA-Z]/.test(password)
    });
  }, [password]);

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    setEmailError(isValid ? null : "Email inválido");
    return isValid;
  };

  const handleSignUp = async (e: React.FormEvent, userType: 'solicitante' | 'freelancer') => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      return;
    }
    
    if (!firstName || !lastName) {
      setError("Nome e sobrenome são obrigatórios");
      return;
    }
    
    if (!validations.length || !validations.hasNumber || !validations.hasLetter) {
      setError("A senha não atende aos requisitos mínimos");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { session } = await signUp(email, password, firstName, lastName, userType);
      
      toast({
        title: "Cadastro realizado",
        description: session 
          ? "Conta criada com sucesso!" 
          : "Verifique seu e-mail para confirmar seu cadastro."
      });
      
      // Se não for necessário confirmar o e-mail
      if (session) {
        navigate('/');
      } else {
        toast({
          title: "Confirmação necessária",
          description: "Enviamos um email de confirmação. Por favor, verifique sua caixa de entrada."
        });
        navigate('/login');
      }
    } catch (error: any) {
      console.error("Erro de cadastro:", error);
      setError(error.message || "Erro ao criar conta. Verifique os dados e tente novamente.");
      toast({
        title: "Erro no cadastro",
        description: error.message || "Ocorreu um erro no cadastro",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-helpaqui-blue">
          Help<span className="text-helpaqui-green">Aqui</span>
        </h1>
        <p className="text-gray-600 mt-2">Crie sua conta no HelpAqui</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md">
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

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <TabsContent value="solicitante">
          <Card>
            <CardHeader>
              <CardTitle>Cadastro de Solicitante</CardTitle>
              <CardDescription>
                Precisa encontrar freelancers qualificados para seus projetos
              </CardDescription>
            </CardHeader>
            <form onSubmit={(e) => handleSignUp(e, 'solicitante')}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="solicitante-first-name">Nome</Label>
                    <Input 
                      id="solicitante-first-name" 
                      type="text" 
                      placeholder="Seu nome" 
                      value={firstName} 
                      onChange={e => setFirstName(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="solicitante-last-name">Sobrenome</Label>
                    <Input 
                      id="solicitante-last-name" 
                      type="text" 
                      placeholder="Seu sobrenome" 
                      value={lastName} 
                      onChange={e => setLastName(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="solicitante-email">Email</Label>
                  <Input 
                    id="solicitante-email" 
                    type="email" 
                    placeholder="seu@email.com" 
                    value={email} 
                    onChange={e => {
                      setEmail(e.target.value);
                      if (e.target.value) validateEmail(e.target.value);
                    }}
                    className={emailError ? "border-red-500" : ""}
                    required 
                  />
                  {emailError && <p className="text-xs text-red-500">{emailError}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="solicitante-password">Senha</Label>
                  <Input 
                    id="solicitante-password" 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                    className={!validations.length ? "border-red-300" : ""}
                  />
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 mr-2 rounded-full flex items-center justify-center ${validations.length ? 'bg-green-500' : 'bg-gray-300'}`}>
                        {validations.length && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span className="text-xs text-gray-600">Pelo menos 6 caracteres</span>
                    </div>
                    <div className="flex items-center">
                      <div className={`w-4 h-4 mr-2 rounded-full flex items-center justify-center ${validations.hasNumber ? 'bg-green-500' : 'bg-gray-300'}`}>
                        {validations.hasNumber && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span className="text-xs text-gray-600">Pelo menos um número</span>
                    </div>
                    <div className="flex items-center">
                      <div className={`w-4 h-4 mr-2 rounded-full flex items-center justify-center ${validations.hasLetter ? 'bg-green-500' : 'bg-gray-300'}`}>
                        {validations.hasLetter && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span className="text-xs text-gray-600">Pelo menos uma letra</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <div className="px-6 pb-6">
                <Button 
                  type="submit" 
                  className="w-full bg-helpaqui-blue" 
                  disabled={loading || !validations.length || !validations.hasNumber || !validations.hasLetter || !firstName || !lastName || !email || !!emailError}
                >
                  {loading ? "Cadastrando..." : "Cadastrar como Solicitante"}
                </Button>
                <div className="text-sm text-center mt-4">
                  <span className="text-gray-600">Já tem uma conta? </span>
                  <Button variant="link" className="p-0" onClick={() => navigate('/login')}>
                    Fazer login
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="freelancer">
          <Card>
            <CardHeader>
              <CardTitle>Cadastro de Freelancer</CardTitle>
              <CardDescription>
                Quero oferecer meus serviços e encontrar novas oportunidades
              </CardDescription>
            </CardHeader>
            <form onSubmit={(e) => handleSignUp(e, 'freelancer')}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="freelancer-first-name">Nome</Label>
                    <Input 
                      id="freelancer-first-name" 
                      type="text" 
                      placeholder="Seu nome" 
                      value={firstName} 
                      onChange={e => setFirstName(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="freelancer-last-name">Sobrenome</Label>
                    <Input 
                      id="freelancer-last-name" 
                      type="text" 
                      placeholder="Seu sobrenome" 
                      value={lastName} 
                      onChange={e => setLastName(e.target.value)} 
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
                    value={email} 
                    onChange={e => {
                      setEmail(e.target.value);
                      if (e.target.value) validateEmail(e.target.value);
                    }}
                    className={emailError ? "border-red-500" : ""}
                    required 
                  />
                  {emailError && <p className="text-xs text-red-500">{emailError}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="freelancer-password">Senha</Label>
                  <Input 
                    id="freelancer-password" 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                    className={!validations.length ? "border-red-300" : ""}
                  />
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 mr-2 rounded-full flex items-center justify-center ${validations.length ? 'bg-green-500' : 'bg-gray-300'}`}>
                        {validations.length && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span className="text-xs text-gray-600">Pelo menos 6 caracteres</span>
                    </div>
                    <div className="flex items-center">
                      <div className={`w-4 h-4 mr-2 rounded-full flex items-center justify-center ${validations.hasNumber ? 'bg-green-500' : 'bg-gray-300'}`}>
                        {validations.hasNumber && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span className="text-xs text-gray-600">Pelo menos um número</span>
                    </div>
                    <div className="flex items-center">
                      <div className={`w-4 h-4 mr-2 rounded-full flex items-center justify-center ${validations.hasLetter ? 'bg-green-500' : 'bg-gray-300'}`}>
                        {validations.hasLetter && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span className="text-xs text-gray-600">Pelo menos uma letra</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <div className="px-6 pb-6">
                <Button 
                  type="submit" 
                  className="w-full bg-helpaqui-green" 
                  disabled={loading || !validations.length || !validations.hasNumber || !validations.hasLetter || !firstName || !lastName || !email || !!emailError}
                >
                  {loading ? "Cadastrando..." : "Cadastrar como Freelancer"}
                </Button>
                <div className="text-sm text-center mt-4">
                  <span className="text-gray-600">Já tem uma conta? </span>
                  <Button variant="link" className="p-0" onClick={() => navigate('/login')}>
                    Fazer login
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Register;
