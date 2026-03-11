
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BriefcaseBusiness, UserRound, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

type UserType = 'solicitante' | 'freelancer' | 'empresa';

const UserTypeSelection = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<UserType | null>(null);

  const handleTypeSelection = async (userType: UserType) => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: { user_type: userType }
      });

      if (error) throw error;

      localStorage.setItem('userType', userType);

      const labels: Record<UserType, string> = {
        solicitante: 'Solicitante',
        freelancer: 'Freelancer',
        empresa: 'Empresa'
      };

      toast.success(`Tipo de usuário definido como ${labels[userType]}.`);
      navigate('/', { replace: true });
    } catch (error: any) {
      console.error("Erro ao definir tipo de usuário:", error);
      toast.error(error.message || "Erro ao definir tipo de usuário");
    } finally {
      setLoading(false);
    }
  };

  const ringColor = selectedType === 'freelancer' 
    ? 'ring-helpaqui-green' 
    : selectedType === 'empresa' 
    ? 'ring-orange-500' 
    : 'ring-helpaqui-blue';

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-helpaqui-blue">
          Help<span className="text-helpaqui-green">Aqui</span>
        </h1>
        <p className="text-muted-foreground mt-2">Como você quer usar o HelpAqui?</p>
      </div>

      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          className={`cursor-pointer transition-all hover:shadow-lg ${
            selectedType === 'solicitante' ? 'ring-2 ring-helpaqui-blue' : ''
          }`}
          onClick={() => setSelectedType('solicitante')}
        >
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-helpaqui-light-blue rounded-full w-fit">
              <UserRound className="h-8 w-8 text-helpaqui-blue" />
            </div>
            <CardTitle className="text-helpaqui-blue">Sou Solicitante</CardTitle>
            <CardDescription>
              Preciso encontrar profissionais para meus projetos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Publique suas necessidades</li>
              <li>• Receba propostas de freelancers</li>
              <li>• Escolha o melhor profissional</li>
              <li>• Acompanhe o progresso</li>
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
            <div className="mx-auto mb-4 p-3 bg-helpaqui-light-green rounded-full w-fit">
              <BriefcaseBusiness className="h-8 w-8 text-helpaqui-green" />
            </div>
            <CardTitle className="text-helpaqui-green">Sou Freelancer</CardTitle>
            <CardDescription>
              Quero oferecer meus serviços e encontrar oportunidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Cadastre seus serviços</li>
              <li>• Encontre clientes próximos</li>
              <li>• Gerencie seus trabalhos</li>
              <li>• Receba pagamentos seguros</li>
            </ul>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-lg ${
            selectedType === 'empresa' ? 'ring-2 ring-orange-500' : ''
          }`}
          onClick={() => setSelectedType('empresa')}
        >
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-orange-100 rounded-full w-fit">
              <Building2 className="h-8 w-8 text-orange-600" />
            </div>
            <CardTitle className="text-orange-600">Sou Empresa</CardTitle>
            <CardDescription>
              Quero divulgar vagas, serviços e minha marca
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Divulgue vagas de emprego</li>
              <li>• Promova sua empresa</li>
              <li>• Encontre freelancers</li>
              <li>• Ofereça serviços</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Button 
          size="lg"
          disabled={!selectedType || loading}
          onClick={() => selectedType && handleTypeSelection(selectedType)}
          className={
            selectedType === 'freelancer' ? 'bg-helpaqui-green' 
            : selectedType === 'empresa' ? 'bg-orange-500 hover:bg-orange-600' 
            : 'bg-helpaqui-blue'
          }
        >
          {loading ? "Configurando..." : "Continuar"}
        </Button>
      </div>
    </div>
  );
};

export default UserTypeSelection;
