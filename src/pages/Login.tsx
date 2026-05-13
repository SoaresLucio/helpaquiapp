
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BriefcaseBusiness, UserRound, Building2, Shield, Zap } from 'lucide-react';
import LoginHeader from '@/components/auth/LoginHeader';
import SolicitanteLoginForm from '@/components/auth/SolicitanteLoginForm';
import FreelancerLoginForm from '@/components/auth/FreelancerLoginForm';
import EmpresaLoginForm from '@/components/auth/EmpresaLoginForm';
import PrivacyPolicyDialog from '@/components/PrivacyPolicyDialog';
import TermsOfUseDialog from '@/components/TermsOfUseDialog';
import PageSEO from '@/components/common/PageSEO';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }
  })
};

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  return (
    <PageSEO
      title="Login"
      description="Acesse sua conta HelpAqui para gerenciar serviços, propostas e pagamentos."
      path="/login"
    >
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
        <LoginHeader />
      </motion.div>

      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1} className="w-full max-w-md">
        <Tabs defaultValue="solicitante">
          <TabsList className="grid grid-cols-3 mb-6 h-12 bg-muted/80 rounded-xl">
            <TabsTrigger value="solicitante" className="flex items-center gap-1 text-sm font-medium rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <UserRound className="h-4 w-4" />
              <span className="hidden sm:inline">Solicitante</span>
            </TabsTrigger>
            <TabsTrigger value="freelancer" className="flex items-center gap-1 text-sm font-medium rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <BriefcaseBusiness className="h-4 w-4" />
              <span className="hidden sm:inline">Freelancer</span>
            </TabsTrigger>
            <TabsTrigger value="empresa" className="flex items-center gap-1 text-sm font-medium rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Empresa</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="solicitante">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <SolicitanteLoginForm isLoading={isLoading} setIsLoading={setIsLoading} googleLoading={googleLoading} setGoogleLoading={setGoogleLoading} />
            </motion.div>
          </TabsContent>
          <TabsContent value="freelancer">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <FreelancerLoginForm isLoading={isLoading} setIsLoading={setIsLoading} googleLoading={googleLoading} setGoogleLoading={setGoogleLoading} />
            </motion.div>
          </TabsContent>
          <TabsContent value="empresa">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <EmpresaLoginForm isLoading={isLoading} setIsLoading={setIsLoading} googleLoading={googleLoading} setGoogleLoading={setGoogleLoading} />
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>

      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2} className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1"><Shield className="h-3 w-3" /><span>SSL Protegido</span></div>
        <div className="flex items-center gap-1"><Zap className="h-3 w-3" /><span>Dados criptografados</span></div>
      </motion.div>

      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3} className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
        <button type="button" className="hover:underline hover:text-foreground transition-colors" onClick={() => setPrivacyOpen(true)}>Política de Privacidade</button>
        <span>•</span>
        <button type="button" className="hover:underline hover:text-foreground transition-colors" onClick={() => setTermsOpen(true)}>Termos de Uso</button>
      </motion.div>

      <PrivacyPolicyDialog open={privacyOpen} onOpenChange={setPrivacyOpen} onAccept={() => setPrivacyOpen(false)} />
      <TermsOfUseDialog open={termsOpen} onOpenChange={setTermsOpen} onAccept={() => setTermsOpen(false)} />
    </div>
    </PageSEO>
  );
};

export default Login;
