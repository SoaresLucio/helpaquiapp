
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BriefcaseBusiness, UserRound, AlertCircle, LockIcon, Check, Shield, Zap } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { signIn, signUp } from '@/services/authService';
import { supabase } from "@/integrations/supabase/client";
import PageSEO from '@/components/common/PageSEO';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }
  })
};

interface FormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface ValidationState {
  length: boolean;
  hasNumber: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
}

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({ email: '', password: '', firstName: '', lastName: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('login');
  const [validations, setValidations] = useState<ValidationState>({ length: false, hasNumber: false, hasUppercase: false, hasLowercase: false });
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
      length: formData.password.length >= 8,
      hasNumber: /\d/.test(formData.password),
      hasUppercase: /[A-Z]/.test(formData.password),
      hasLowercase: /[a-z]/.test(formData.password)
    });
  }, [formData.password]);

  const isPasswordValid = validations.length && validations.hasNumber && validations.hasUppercase && validations.hasLowercase;

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
      if (!formData.firstName.trim() || !formData.lastName.trim()) { setError("Nome e sobrenome são obrigatórios"); return; }
      if (!isPasswordValid) { setError("A senha não atende aos requisitos mínimos"); return; }
    }
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        const { session } = await signUp(formData.email, formData.password, formData.firstName, formData.lastName, 'solicitante');
        toast({ title: "Cadastro realizado", description: session ? "Conta criada com sucesso!" : "Verifique seu e-mail para confirmar seu cadastro." });
        if (session) { navigate('/dashboard'); } else { setActiveTab('login'); }
      } else {
        await signIn(formData.email, formData.password);
        toast({ title: "Login bem-sucedido", description: "Bem-vindo de volta!" });
        navigate('/dashboard');
      }
    } catch (error: any) {
      setError(error.message || `Erro ao ${isSignUp ? 'criar conta' : 'fazer login'}.`);
    } finally {
      setLoading(false);
    }
  };

  const ValidationIcon = ({ isValid }: { isValid: boolean }) => (
    <div className={`w-4 h-4 mr-2 rounded-full flex items-center justify-center transition-colors ${isValid ? 'bg-primary' : 'bg-muted'}`}>
      {isValid && <Check className="h-3 w-3 text-primary-foreground" />}
    </div>
  );

  return (
    <PageSEO
      title="Login e Cadastro"
      description="Entre ou cadastre-se na HelpAqui para encontrar profissionais qualificados ou oferecer seus serviços."
      path="/auth"
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
        <p className="text-muted-foreground">Freelancers profissionais perto de você</p>
      </motion.div>

      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1} className="w-full max-w-md">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-6 h-12 bg-muted/80 rounded-xl">
            <TabsTrigger value="login" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <UserRound className="h-4 w-4" />
              Login
            </TabsTrigger>
            <TabsTrigger value="signup" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <BriefcaseBusiness className="h-4 w-4" />
              Cadastro
            </TabsTrigger>
          </TabsList>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <Alert variant="destructive" className="mb-4 rounded-xl">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          <TabsContent value="login">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card className="border-border/50 shadow-xl shadow-primary/5 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-xl">Entrar</CardTitle>
                  <CardDescription>Acesse sua conta HelpAqui</CardDescription>
                </CardHeader>
                <form onSubmit={(e) => handleSubmit(e, false)}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="seu@email.com" value={formData.email} onChange={e => updateFormData('email', e.target.value)} className={`rounded-xl h-11 ${emailError ? "border-destructive" : ""}`} required />
                      {emailError && <p className="text-xs text-destructive">{emailError}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Senha</Label>
                      <div className="relative">
                        <Input id="password" type="password" value={formData.password} onChange={e => updateFormData('password', e.target.value)} className="rounded-xl h-11" required />
                        <LockIcon className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex-col space-y-3">
                    <Button type="submit" className="w-full h-11 rounded-xl gradient-primary text-white border-0 shadow-lg shadow-primary/25" disabled={loading}>
                      {loading ? "Entrando..." : "Entrar"}
                    </Button>
                    <div className="text-sm text-center">
                      <span className="text-muted-foreground">Não tem uma conta? </span>
                      <Button variant="link" className="p-0 text-primary" onClick={() => navigate('/register')}>Cadastre-se</Button>
                    </div>
                  </CardFooter>
                </form>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="signup">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card className="border-border/50 shadow-xl shadow-primary/5 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-xl">Cadastro Rápido</CardTitle>
                  <CardDescription>Crie sua conta para usar o HelpAqui</CardDescription>
                </CardHeader>
                <form onSubmit={(e) => handleSubmit(e, true)}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input id="signup-email" type="email" placeholder="seu@email.com" value={formData.email} onChange={e => updateFormData('email', e.target.value)} className={`rounded-xl h-11 ${emailError ? "border-destructive" : ""}`} required />
                      {emailError && <p className="text-xs text-destructive">{emailError}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="first-name">Nome</Label>
                        <Input id="first-name" type="text" placeholder="Seu nome" value={formData.firstName} onChange={e => updateFormData('firstName', e.target.value)} className="rounded-xl h-11" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last-name">Sobrenome</Label>
                        <Input id="last-name" type="text" placeholder="Sobrenome" value={formData.lastName} onChange={e => updateFormData('lastName', e.target.value)} className="rounded-xl h-11" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Senha</Label>
                      <Input id="signup-password" type="password" value={formData.password} onChange={e => updateFormData('password', e.target.value)} className={`rounded-xl h-11 ${formData.password && !isPasswordValid ? "border-destructive/50" : ""}`} required />
                      <div className="mt-2 space-y-1.5">
                        {[
                          { ok: validations.length, label: "Pelo menos 8 caracteres" },
                          { ok: validations.hasUppercase, label: "Pelo menos uma maiúscula" },
                          { ok: validations.hasLowercase, label: "Pelo menos uma minúscula" },
                          { ok: validations.hasNumber, label: "Pelo menos um número" },
                        ].map(({ ok, label }) => (
                          <div key={label} className="flex items-center">
                            <ValidationIcon isValid={ok} />
                            <span className={`text-xs ${ok ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex-col space-y-3">
                    <Button type="submit" className="w-full h-11 rounded-xl gradient-primary text-white border-0 shadow-lg shadow-primary/25" disabled={loading || !isPasswordValid || !formData.firstName.trim() || !formData.lastName.trim() || !formData.email || !!emailError}>
                      {loading ? "Cadastrando..." : "Cadastrar"}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Para cadastro completo como Freelancer ou Empresa,{' '}
                      <Button variant="link" className="p-0 text-primary text-xs h-auto" onClick={() => navigate('/register')}>clique aqui</Button>
                    </p>
                  </CardFooter>
                </form>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>

      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2} className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1"><Shield className="h-3 w-3" /><span>SSL Protegido</span></div>
        <div className="flex items-center gap-1"><Zap className="h-3 w-3" /><span>Dados criptografados</span></div>
      </motion.div>
    </div>
  );
};

export default Auth;
