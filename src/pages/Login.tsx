
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BriefcaseBusiness, UserRound, Building2 } from 'lucide-react';
import SolicitanteLoginForm from '@/components/auth/SolicitanteLoginForm';
import FreelancerLoginForm from '@/components/auth/FreelancerLoginForm';
import EmpresaLoginForm from '@/components/auth/EmpresaLoginForm';
import { LoginIllustration } from '@/components/auth/illustrations/AuthIllustration';
import { cn } from '@/lib/utils';

const tabs = [
  { value: 'solicitante', label: 'Solicitante', icon: UserRound },
  { value: 'freelancer', label: 'Freelancer', icon: BriefcaseBusiness },
  { value: 'empresa', label: 'Empresa', icon: Building2 },
];

const bullets = ['Profissionais verificados', 'Pagamento seguro', 'Suporte 24h'];

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('solicitante');

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

          <LoginIllustration />

          <h2 className="text-xl font-bold text-slate-800 mt-6">
            Conecte-se com profissionais
          </h2>
          <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">
            Encontre freelancers qualificados ou ofereça seus serviços na maior plataforma do Brasil.
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
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-12">

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
          <div className="mb-7">
            <h1 className="text-2xl font-black text-slate-900">Entrar</h1>
            <p className="text-slate-500 text-sm mt-1">Bem-vindo de volta! Acesse sua conta.</p>
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

          {/* Form com AnimatePresence */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
            >
              {activeTab === 'solicitante' && (
                <SolicitanteLoginForm
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                  googleLoading={googleLoading}
                  setGoogleLoading={setGoogleLoading}
                />
              )}
              {activeTab === 'freelancer' && (
                <FreelancerLoginForm
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                  googleLoading={googleLoading}
                  setGoogleLoading={setGoogleLoading}
                />
              )}
              {activeTab === 'empresa' && (
                <EmpresaLoginForm
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                  googleLoading={googleLoading}
                  setGoogleLoading={setGoogleLoading}
                />
              )}
            </motion.div>
          </AnimatePresence>

          <p className="text-center text-slate-500 text-sm mt-6">
            Não tem conta?{' '}
            <a href="/register" className="font-semibold hover:opacity-80 transition-opacity" style={{ color: '#6c2ea0' }}>
              Criar conta grátis
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
