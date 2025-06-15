
import React from 'react';
import { Button } from '@/components/ui/button';
import { Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FreelancerWelcomeSectionProps {
  userName: string;
  pendingRequests: number;
}

const FreelancerWelcomeSection: React.FC<FreelancerWelcomeSectionProps> = ({
  userName,
  pendingRequests
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-xl p-6 text-white">
      <h1 className="text-2xl font-bold mb-2">
        Bem-vindo de volta, {userName}! 👋
      </h1>
      <p className="text-blue-100 mb-4">
        Você tem {pendingRequests} novas solicitações de serviço
      </p>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => navigate('/service-requests')}>
          <Briefcase className="h-4 w-4 mr-2" />
          Ver Solicitações
        </Button>
        <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
          Meus Trabalhos
        </Button>
      </div>
    </div>
  );
};

export default FreelancerWelcomeSection;
