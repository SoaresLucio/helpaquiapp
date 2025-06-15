
import React from 'react';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Professional } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';
import ProfessionalAvatar from '@/components/professional/ProfessionalAvatar';
import ProfessionalInfo from '@/components/professional/ProfessionalInfo';
import ProfessionalPortfolio from '@/components/professional/ProfessionalPortfolio';

interface ProfessionalCardProps {
  professional: Professional;
}

const ProfessionalCard: React.FC<ProfessionalCardProps> = ({ professional }) => {
  const navigate = useNavigate();
  
  const isVerified = professional.isVerified || false;
  const responseTime = professional.responseTime || "1h";
  const responseRate = professional.responseRate || 95;

  const handleViewProfile = () => {
    const freelancerId = professional.id.split('/')[0];
    navigate(`/freelancer/${freelancerId}`);
  };

  const handleContact = () => {
    navigate('/chat');
  };

  return (
    <div className="helpaqui-card p-4 mb-4">
      <div className="flex items-start">
        <ProfessionalAvatar
          avatar={professional.avatar}
          name={professional.name}
          available={professional.available}
          isVerified={isVerified}
        />
        
        <ProfessionalInfo
          name={professional.name}
          categories={professional.categories}
          rating={professional.rating}
          ratingCount={professional.ratingCount}
          distance={professional.distance}
          available={professional.available}
          isVerified={isVerified}
          description={professional.description}
          responseTime={responseTime}
          responseRate={responseRate}
        />
      </div>
      
      {/* HELPAQUI Garantia */}
      <div className="flex items-center mb-3 bg-green-50 rounded px-3 py-1.5">
        <Shield className="h-4 w-4 text-green-600 mr-2" />
        <span className="text-xs text-green-800">
          HELPAQUI Garantia: Cobertura para reparos em até 7 dias
        </span>
      </div>
      
      {/* Privacy Notice */}
      <div className="flex items-center mb-3 bg-blue-50 rounded px-3 py-1.5">
        <Shield className="h-4 w-4 text-blue-600 mr-2" />
        <span className="text-xs text-blue-800">
          Contato seguro: Informações pessoais compartilhadas apenas após confirmação de serviço
        </span>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="font-medium text-helpaqui-blue">{professional.price}</span>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleViewProfile}>
            Ver perfil
          </Button>
          <Button size="sm" className="helpaqui-button-primary" onClick={handleContact}>
            Contatar
          </Button>
        </div>
      </div>
      
      <ProfessionalPortfolio portfolio={professional.portfolio || []} />
    </div>
  );
};

export default ProfessionalCard;
