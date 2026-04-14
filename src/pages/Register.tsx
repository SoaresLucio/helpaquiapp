
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BriefcaseBusiness, UserRound, AlertCircle, Check, Building2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { signUp } from '@/services/authService';
import { supabase } from "@/integrations/supabase/client";
import EmpresaRegisterForm from '@/components/empresa/EmpresaRegisterForm';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { RegisterIllustration } from '@/components/auth/illustrations/AuthIllustration';

const tabs = [
  { value: 'solicitante', label: 'Solicitante', icon: UserRound },
  { value: 'freelancer', label: 'Freelancer', icon: BriefcaseBusiness },
  { value: 'empresa', label: 'Empresa', icon: Building2 },
];

const bullets = ['Crie seu perfil grátis', 'Conecte-se com clientes', 'Receba pagamentos seguros'];

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
        navigate('/login');
      }
    } catch (err: unknown) {
      console.error("Erro de cadastro:", err);
      const message = err instanceof Error ? err.message : "Erro ao criar conta. Verifique os dados e tente novamente.";
      setError(message);
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
          <div
            className={`w-4 h-4 mr-2 rounded-full flex items-center justify-center transition-colors ${ok ? '' : 'bg-slate-200'}`}
            style={ok ? { background: 'linear-gradient(135deg, #6c2ea0, #2b439b)' } : {}}
          >
            {ok && <Check className="h-3 w-3 text-white" />}
          </div>
          <span className={`text-xs ${ok ? 'text-purple-700' : 'text-slate-400'}`}>{label}</span>
        </div>
      ))}
    </div>
  );

  const RegisterForm = ({ userType }: { userType: 'solicitante' | 'freelancer' }) => (
    <form onSubmit={(e) => handleSignUp(e, userType)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-slate-700 text-sm font-medium">Nome</Label>
          <Input
            type="text"
            placeholder="Seu nome"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            required
            className="bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-purple-400/30 focus-visible:border-purple-500 rounded-xl h-11 transition-all"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-slate-700 text-sm font-medium">Sobrenome</Label>
          <Input
            type="text"
            placeholder="Seu sobrenome"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            required
            className="bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-purple-400/30 focus-visible:border-purple-500 rounded-xl h-11 transition-all"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-slate-700 text-sm font-medium">Email</Label>
        <Input
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={e => { setEmail(e.target.value); if (e.target.value) validateEmailField(e.target.value); }}
          className={cn(
            "bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-purple-400/30 focus-visible:border-purple-500 rounded-xl h-11 transition-all",
            emailError ? "border-destructive" : ""
          )}
          required
        />
        {emailError && <p className="text-xs text-destructive">{emailError}</p>}
      </div>
      <div className="space-y-1.5">
        <Label className="text-slate-700 text-sm font-medium">Senha</Label>
        <Input
          type="password"
          placeholder="Crie uma senha segura"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className={cn(
            "bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-purple-400/30 focus-visible:border-purple-500 rounded-xl h-11 transition-all",
            password && !isPasswordValid ? "border-destructive" : ""
          )}
        />
        <PasswordChecklist />
      </div>

      <motion.button
        type="submit"
        disabled={loading || !isPasswordValid || !firstName.trim() || !lastName.trim() || !email || !!emailError}
        whileHover={{ scale: 1.01, boxShadow: '0 8px 25px rgba(108,46,160,0.3)' }}
        whileTap={{ scale: 0.99 }}
        className="w-full h-11 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-60"
        style={{
          background: 'linear-gradient(135deg, #6c2ea0, #2b439b)',
        }}
      >
        {loading ? "Cadastrando..." : `Cadastrar como ${userType === 'solicitante' ? 'Solicitante' : 'Freelancer'}`}
      </motion.button>

      <p className="text-center text-slate-500 text-sm">
        Já tem uma conta?{' '}
        <Link to="/login" style={{ color: '#6c2ea0' }} className="font-semibold hover:opacity-80 transition-opacity">
          Fazer login
        </Link>
      </p>
    </form>
  );

  return (
    <div className="min-h-screen bg-white flex">

      {/* LADO ESQUERDO — ilustração (oculto no mobile) */}
      <div
        className="hidden lg:flex flex-col items-center justify-center w-1/2 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #f8f5ff 0%, #ede9fe 50%, #f0f7ff 100%)' }}
      >
        {/* Barra gradiente topo */}
        <div
          className="absolute top-0 left-0 w-full h-1.5"
          style={{ background: 'linear-gradient(90deg, #6c2ea0, #2b439b)' }}
        />

        {/* Círculos decorativos */}
        <div
          className="absolute top-8 right-8 w-32 h-32 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #6c2ea0, transparent)' }}
        />
        <div
          className="absolute bottom-8 left-8 w-24 h-24 rounded-full opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #2b439b, transparent)' }}
        />

        <div className="relative z-10 px-12 text-center">
          {/* Logo */}
          <div className="inline-flex items-center gap-3 mb-10">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6c2ea0, #2b439b)' }}
            >
              <span className="text-white font-black text-lg">H</span>
            </div>
            <span className="text-2xl font-black text-slate-900">HelpAqui</span>
          </div>

          <RegisterIllustration />

          <h2 className="text-xl font-bold text-slate-800 mt-6">
            Junte-se à nossa comunidade
          </h2>
          <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">
            Milhares de profissionais e solicitantes já confiam na HelpAqui para conectar talentos e oportunidades.
          </p>

          {/* Bullets */}
          <div className="mt-4 space-y-2">
            {bullets.map((item, i) => (
              <motion.div
                key={item}
                className="flex items-center gap-2 justify-center"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.15 }}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, #6c2ea0, #2b439b)' }}
                >
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-slate-600 text-sm">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* LADO DIREITO — formulário */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-12 overflow-y-auto">

        {/* Logo mobile */}
        <div className="flex lg:hidden items-center gap-2 mb-8">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6c2ea0, #2b439b)' }}
          >
            <span className="text-white font-black text-sm">H</span>
          </div>
          <span className="text-xl font-black text-slate-900">HelpAqui</span>
        </div>

        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Badge + Título */}
          <div className="mb-7">
            <div
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-3"
              style={{ background: 'rgba(108,46,160,0.08)', color: '#6c2ea0' }}
            >
              Grátis para sempre ✓
            </div>
            <h1 className="text-2xl font-black text-slate-900">Criar conta</h1>
            <p className="text-slate-500 text-sm mt-1">Junte-se a milhares de profissionais.</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-slate-100 rounded-2xl p-1 mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    'flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-1',
                    activeTab === tab.value
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Error alert */}
          {error && (
            <Alert variant="destructive" className="mb-4 rounded-xl">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Form com AnimatePresence */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
            >
              {activeTab === 'solicitante' && <RegisterForm userType="solicitante" />}
              {activeTab === 'freelancer' && <RegisterForm userType="freelancer" />}
              {activeTab === 'empresa' && <EmpresaRegisterForm />}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
