
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BriefcaseBusiness, UserRound } from 'lucide-react';
import LoginHeader from '@/components/auth/LoginHeader';
import SolicitanteLoginForm from '@/components/auth/SolicitanteLoginForm';
import FreelancerLoginForm from '@/components/auth/FreelancerLoginForm';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <LoginHeader />

      <Tabs defaultValue="solicitante" className="w-full max-w-md">
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
      </Tabs>
    </div>
  );
};

export default Login;
