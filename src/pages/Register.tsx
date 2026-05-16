
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BriefcaseBusiness, UserRound, AlertCircle, Check, Building2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { signUp } from '@/services/authService';
import { supabase } from "@/integrations/supabase/client";
import EmpresaRegisterForm from '@/components/empresa/EmpresaRegisterForm';
import PageSEO from '@/components/common/PageSEO';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }
  })
};

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
  const [validations, setValidations] = useState({ length: false, hasNumber: false, hasUppercase: false, hasLowercase: false });
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) navigate('/dashboard');
    };
    checkUser();
  }, [navigate]);

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
    if (!firstName.trim() || !lastName.trim()) { setError("Nome e sobrenome são obrigatórios"); return; }
    if (!isPasswordValid) { setError("A senha não atende aos requisitos mínimos"); return; }
    setLoading(true);
    setError(null);
    try {
      const result = await signUp(email, password, firstName, lastName, userType);
      toast({ title: "Cadastro realizado", description: result?.session ? "Conta criada com sucesso!" : "Verifique seu e-mail." });
      if (result?.session) navigate('/dashboard'); else navigate('/login');
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  };

  const PasswordChecklist = () => (
    <div className="mt-2 space-y-1.5">
      {[
        { ok: validations.length, label: "Pelo menos 8 caracteres" },
        { ok: validations.hasUppercase, label: "Pelo menos uma maiúscula" },
        { ok: validations.hasLowercase, label: "Pelo menos uma minúscula" },
        { ok: validations.hasNumber, label: "Pelo menos um número" }
      ].map(({ ok, label }) => (
        <div key={label} className="flex items-center">
          <div className={`w-4 h-4 mr-2 rounded-full flex items-center justify-center transition-colors ${ok ? 'bg-primary' : 'bg-muted'}`}>
            {ok && <Check className="h-3 w-3 text-primary-foreground" />}
          </div>
          <span className={`text-xs ${ok ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
        </div>
      ))}
    </div>
  );

  const RegisterForm = ({ userType }: { userType: 'solicitante' | 'freelancer' }) => {
    const fnId = `firstName-${userType}`;
    const lnId = `lastName-${userType}`;
    const emId = `email-${userType}`;
    const pwId = `password-${userType}`;
    return (
    <Card className="border-border/50 shadow-xl shadow-primary/5 rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl">Cadastro de {userType === 'solicitante' ? 'Solicitante' : 'Freelancer'}</CardTitle>
        <CardDescription>
          {userType === 'solicitante' ? 'Encontre freelancers qualificados' : 'Ofereça seus serviços profissionais'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={(e) => handleSignUp(e, userType)}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor={fnId}>Nome</Label>
              <Input id={fnId} placeholder="Seu nome" value={firstName} onChange={e => setFirstName(e.target.value)} className="rounded-xl h-11" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor={lnId}>Sobrenome</Label>
              <Input id={lnId} placeholder="Sobrenome" value={lastName} onChange={e => setLastName(e.target.value)} className="rounded-xl h-11" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor={emId}>Email</Label>
            <Input id={emId} type="email" placeholder="seu@email.com" value={email} onChange={e => { setEmail(e.target.value); if (e.target.value) validateEmailField(e.target.value); }} className={`rounded-xl h-11 ${emailError ? "border-destructive" : ""}`} required />
            {emailError && <p className="text-xs text-destructive">{emailError}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor={pwId}>Senha</Label>
            <Input id={pwId} type="password" placeholder="Crie uma senha segura" value={password} onChange={e => setPassword(e.target.value)} className={`rounded-xl h-11 ${password && !isPasswordValid ? "border-destructive/50" : ""}`} required />
            <PasswordChecklist />
          </div>
        </CardContent>
        <div className="px-6 pb-6">
          <Button type="submit" className="w-full h-11 rounded-xl gradient-primary text-white border-0 shadow-lg shadow-primary/25" disabled={loading || !isPasswordValid || !firstName.trim() || !lastName.trim() || !email || !!emailError}>
            {loading ? "Cadastrando..." : `Cadastrar como ${userType === 'solicitante' ? 'Solicitante' : 'Freelancer'}`}
          </Button>
          <div className="text-sm text-center mt-4">
            <span className="text-muted-foreground">Já tem uma conta? </span>
            <Button variant="link" className="p-0 text-primary" onClick={() => navigate('/login')}>Fazer login</Button>
          </div>
        </div>
      </form>
    </Card>
    );
  };

  return (
    <PageSEO
      title="Cadastro Grátis"
      description="Cadastre-se como solicitante, freelancer ou empresa na HelpAqui e comece a usar a plataforma #1 de serviços do Brasil."
      path="/register"
    >
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2.5 mb-3">
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
            <span className="text-white font-bold text-lg">H</span>
          </div>
          <span className="font-extrabold text-2xl text-gradient-primary">HelpAqui</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground mt-2">Crie sua conta gratuita no HelpAqui</h1>
        <p className="text-muted-foreground mt-2">Escolha o tipo de conta e comece em menos de 1 minuto</p>
      </motion.div>

      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1} className="w-full max-w-md">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-6 h-12 bg-muted/80 rounded-xl">
            <TabsTrigger value="solicitante" className="flex items-center gap-1 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <UserRound className="h-4 w-4" /><span className="hidden sm:inline">Solicitante</span>
            </TabsTrigger>
            <TabsTrigger value="freelancer" className="flex items-center gap-1 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <BriefcaseBusiness className="h-4 w-4" /><span className="hidden sm:inline">Freelancer</span>
            </TabsTrigger>
            <TabsTrigger value="empresa" className="flex items-center gap-1 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Building2 className="h-4 w-4" /><span className="hidden sm:inline">Empresa</span>
            </TabsTrigger>
          </TabsList>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <Alert variant="destructive" className="mb-4 rounded-xl">
                <AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          <TabsContent value="solicitante">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <RegisterForm userType="solicitante" />
            </motion.div>
          </TabsContent>
          <TabsContent value="freelancer">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <RegisterForm userType="freelancer" />
            </motion.div>
          </TabsContent>
          <TabsContent value="empresa">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <EmpresaRegisterForm />
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
    </PageSEO>
  );
};

export default Register;
