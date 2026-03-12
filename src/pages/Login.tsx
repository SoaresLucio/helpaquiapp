
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BriefcaseBusiness, UserRound, Building2, Shield, Zap } from 'lucide-react';
import LoginHeader from '@/components/auth/LoginHeader';
import SolicitanteLoginForm from '@/components/auth/SolicitanteLoginForm';
import FreelancerLoginForm from '@/components/auth/FreelancerLoginForm';
import EmpresaLoginForm from '@/components/auth/EmpresaLoginForm';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex flex-col items-center justify-center p-4">
      <LoginHeader />

      <Tabs defaultValue="solicitante" className="w-full max-w-md">
        <TabsList className="grid grid-cols-3 mb-6 h-12">
          <TabsTrigger value="solicitante" className="flex items-center gap-1 text-sm font-medium">
            <UserRound className="h-4 w-4" />
            <span className="hidden sm:inline">Solicitante</span>
          </TabsTrigger>
          <TabsTrigger value="freelancer" className="flex items-center gap-1 text-sm font-medium">
            <BriefcaseBusiness className="h-4 w-4" />
            <span className="hidden sm:inline">Freelancer</span>
          </TabsTrigger>
          <TabsTrigger value="empresa" className="flex items-center gap-1 text-sm font-medium">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Empresa</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="solicitante">
          <SolicitanteLoginForm
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            googleLoading={googleLoading}
            setGoogleLoading={setGoogleLoading}
          />
        </TabsContent>

        <TabsContent value="freelancer">
          <FreelancerLoginForm
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            googleLoading={googleLoading}
            setGoogleLoading={setGoogleLoading}
          />
        </TabsContent>

        <TabsContent value="empresa">
          <EmpresaLoginForm
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            googleLoading={googleLoading}
            setGoogleLoading={setGoogleLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Security badges */}
      <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          <span>SSL Protegido</span>
        </div>
        <div className="flex items-center gap-1">
          <Zap className="h-3 w-3" />
          <span>Dados criptografados</span>
        </div>
      </div>

      {/* Footer links */}
      <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
        <button type="button" className="hover:underline" onClick={() => {}}>Política de Privacidade</button>
        <span>•</span>
        <button type="button" className="hover:underline" onClick={() => {}}>Termos de Uso</button>
      </div>
    </div>
  );
};

export default Login;
