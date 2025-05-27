
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BriefcaseBusiness, UserRound } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from "@/integrations/supabase/client";

const UserTypeSelection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<'solicitante' | 'freelancer' | null>(null);

  const handleTypeSelection = async (userType: 'solicitante' | 'freelancer') => {
    setLoading(true);
    
    try {
      // Update user metadata with selected user type
      const { error } = await supabase.auth.updateUser({
        data: {
          user_type: userType
        }
      });

      if (error) {
        throw error;
      }

      // Store in localStorage as backup
      localStorage.setItem('userType', userType);

      toast({
        title: "Tipo de usuário definido",
        description: `Você foi cadastrado como ${userType === 'solicitante' ? 'solicitante' : 'freelancer'}.`
      });

      navigate('/');
    } catch (error: any) {
      console.error("Erro ao definir tipo de usuário:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao definir tipo de usuário",
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
        <p className="text-gray-600 mt-2">Como você quer usar o HelpAqui?</p>
      </div>

      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card 
          className={`cursor-pointer transition-all hover:shadow-lg ${
            selectedType === 'solicitante' ? 'ring-2 ring-helpaqui-blue' : ''
          }`}
          onClick={() => setSelectedType('solicitante')}
        >
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
              <UserRound className="h-8 w-8 text-helpaqui-blue" />
            </div>
            <CardTitle className="text-helpaqui-blue">Sou Solicitante</CardTitle>
            <CardDescription>
              Preciso encontrar freelancers qualificados para meus projetos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Publique suas necessidades</li>
              <li>• Receba propostas de freelancers</li>
              <li>• Escolha o melhor profissional</li>
              <li>• Acompanhe o progresso do trabalho</li>
            </ul>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-lg ${
            selectedType === 'freelancer' ? 'ring-2 ring-helpaqui-green' : ''
          }`}
          onClick={() => setSelectedType('freelancer')}
        >
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
              <BriefcaseBusiness className="h-8 w-8 text-helpaqui-green" />
            </div>
            <CardTitle className="text-helpaqui-green">Sou Freelancer</CardTitle>
            <CardDescription>
              Quero oferecer meus serviços e encontrar novas oportunidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Cadastre seus serviços</li>
              <li>• Encontre clientes próximos</li>
              <li>• Gerencie seus trabalhos</li>
              <li>• Receba pagamentos seguros</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Button 
          size="lg"
          disabled={!selectedType || loading}
          onClick={() => selectedType && handleTypeSelection(selectedType)}
          className={selectedType === 'freelancer' ? 'bg-helpaqui-green' : 'bg-helpaqui-blue'}
        >
          {loading ? "Configurando..." : "Continuar"}
        </Button>
      </div>
    </div>
  );
};

export default UserTypeSelection;
