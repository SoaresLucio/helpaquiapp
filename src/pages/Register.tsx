
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
    hasUppercase: false,
    hasLowercase: false
  });
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) navigate('/');
    };
    checkUser();
  }, [navigate]);

  // Password validation — must match authValidation.ts (8 chars, upper, lower, number)
  useEffect(() => {
    setValidations({
      length: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password)
    });
  }, [password]);

  const validateEmailField = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(value);
    setEmailError(isValid ? null : "Email inválido");
    return isValid;
  };

  const isPasswordValid = validations.length && validations.hasNumber && validations.hasUppercase && validations.hasLowercase;

  const handleSignUp = async (e: React.FormEvent, userType: 'solicitante' | 'freelancer') => {
    e.preventDefault();

    if (!validateEmailField(email)) return;

    if (!firstName.trim() || !lastName.trim()) {
      setError("Nome e sobrenome são obrigatórios");
      return;
    }

    if (!isPasswordValid) {
      setError("A senha não atende aos requisitos mínimos");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await signUp(email, password, firstName, lastName, userType);
      const session = result?.session;

      toast({
        title: "Cadastro realizado",
        description: session
          ? "Conta criada com sucesso!"
          : "Verifique seu e-mail para confirmar seu cadastro."
      });

      if (session) {
        navigate('/');
      } else {
        toast({
          title: "Confirmação necessária",
          description: "Enviamos um email de confirmação. Por favor, verifique sua caixa de entrada."
        });
        navigate('/login');
      }
    } catch (err: any) {
      console.error("Erro de cadastro:", err);
      setError(err.message || "Erro ao criar conta. Verifique os dados e tente novamente.");
      toast({
        title: "Erro no cadastro",
        description: err.message || "Ocorreu um erro no cadastro",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const PasswordChecklist = () => (
    <div className="mt-2 space-y-1">
      {[
        { ok: validations.length, label: "Pelo menos 8 caracteres" },
        { ok: validations.hasUppercase, label: "Pelo menos uma letra maiúscula" },
        { ok: validations.hasLowercase, label: "Pelo menos uma letra minúscula" },
        { ok: validations.hasNumber, label: "Pelo menos um número" }
      ].map(({ ok, label }) => (
        <div key={label} className="flex items-center">
          <div className={`w-4 h-4 mr-2 rounded-full flex items-center justify-center ${ok ? 'bg-green-500' : 'bg-gray-300'}`}>
            {ok && <Check className="h-3 w-3 text-white" />}
          </div>
          <span className={`text-xs ${ok ? 'text-green-600' : 'text-muted-foreground'}`}>{label}</span>
        </div>
      ))}
    </div>
  );

  const RegisterForm = ({ userType, color }: { userType: 'solicitante' | 'freelancer'; color: string }) => (
    <Card>
      <CardHeader>
        <CardTitle>Cadastro de {userType === 'solicitante' ? 'Solicitante' : 'Freelancer'}</CardTitle>
        <CardDescription>
          {userType === 'solicitante'
            ? 'Precisa encontrar freelancers qualificados para seus projetos'
            : 'Quero oferecer meus serviços e encontrar novas oportunidades'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={(e) => handleSignUp(e, userType)}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`${userType}-first-name`}>Nome</Label>
              <Input
                id={`${userType}-first-name`}
                type="text"
                placeholder="Seu nome"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${userType}-last-name`}>Sobrenome</Label>
              <Input
                id={`${userType}-last-name`}
                type="text"
                placeholder="Seu sobrenome"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${userType}-email`}>Email</Label>
            <Input
              id={`${userType}-email`}
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => { setEmail(e.target.value); if (e.target.value) validateEmailField(e.target.value); }}
              className={emailError ? "border-destructive" : ""}
              required
            />
            {emailError && <p className="text-xs text-destructive">{emailError}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${userType}-password`}>Senha</Label>
            <Input
              id={`${userType}-password`}
              type="password"
              placeholder="Crie uma senha segura"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className={password && !isPasswordValid ? "border-destructive" : ""}
            />
            <PasswordChecklist />
          </div>
        </CardContent>
        <div className="px-6 pb-6">
          <Button
            type="submit"
            className={`w-full ${color}`}
            disabled={loading || !isPasswordValid || !firstName.trim() || !lastName.trim() || !email || !!emailError}
          >
            {loading ? "Cadastrando..." : `Cadastrar como ${userType === 'solicitante' ? 'Solicitante' : 'Freelancer'}`}
          </Button>
          <div className="text-sm text-center mt-4">
            <span className="text-muted-foreground">Já tem uma conta? </span>
            <Button variant="link" className="p-0" onClick={() => navigate('/login')}>
              Fazer login
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );

  return (
    <div className="min-h-screen bg-muted flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-helpaqui-blue">
          Help<span className="text-helpaqui-green">Aqui</span>
        </h1>
        <p className="text-muted-foreground mt-2">Crie sua conta no HelpAqui</p>
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
          <RegisterForm userType="solicitante" color="bg-helpaqui-blue" />
        </TabsContent>

        <TabsContent value="freelancer">
          <RegisterForm userType="freelancer" color="bg-helpaqui-green" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Register;
