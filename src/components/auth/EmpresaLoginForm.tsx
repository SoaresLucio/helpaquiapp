
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { SecureInput } from '@/components/security/SecureInput';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { signIn, signInWithGoogle } from '@/services/authService';
import { validateEmail } from '@/utils/inputValidation';
import { useRateLimit } from '@/hooks/useRateLimit';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-slate-700 text-sm font-medium">Email Corporativo</Label>
        <SecureInput
          type="email"
          placeholder="contato@empresa.com"
          value={email}
          onChange={setEmail}
          showSecurityIndicator
          className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-purple-500/30 focus-visible:border-purple-500 rounded-xl h-11 transition-all"
        />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-slate-700 text-sm font-medium">Senha</Label>
          <button
            type="button"
            className="text-xs font-medium hover:opacity-80 transition-opacity"
            style={{ color: '#6c2ea0' }}
            onClick={() => navigate('/reset-password')}
          >
            Esqueci minha senha
          </button>
        </div>
        <SecureInput
          type="password"
          placeholder="Digite sua senha"
          value={password}
          onChange={setPassword}
          autoSanitize={false}
          className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-purple-500/30 focus-visible:border-purple-500 rounded-xl h-11 transition-all"
        />
      </div>

      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="w-full h-11 rounded-xl text-white font-bold text-sm shadow-lg transition-all mt-2 disabled:opacity-60"
        style={{
          background: 'linear-gradient(135deg, #6c2ea0, #2b439b)',
          boxShadow: '0 4px 20px rgba(108,46,160,0.35)',
        }}
      >
        {isLoading ? 'Entrando...' : 'Entrar como Empresa'}
      </motion.button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-2 text-xs text-slate-400">ou continue com</span>
        </div>
      </div>

      <motion.button
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="w-full h-11 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all disabled:opacity-60"
      >
        <GoogleIcon />
        {googleLoading ? 'Entrando...' : 'Entrar com Google'}
      </motion.button>

      <p className="text-center text-slate-500 text-sm mt-2">
        Ainda não tem conta?{' '}
        <Link to="/register?type=empresa" style={{ color: '#6c2ea0' }} className="font-semibold hover:opacity-80 transition-opacity">
          Cadastre sua empresa
        </Link>
      </p>
    </form>
  );
};

export default EmpresaLoginForm;
