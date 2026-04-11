
import React from 'react';

interface JobsHeaderProps {
  userType: 'freelancer' | 'solicitante' | 'empresa' | null;
}

const JobsHeader: React.FC<JobsHeaderProps> = ({ userType }) => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-foreground mb-2">Vagas de Emprego</h1>
      <p className="text-muted-foreground">
        Encontre oportunidades de trabalho CLT e temporárias. 
        {userType === 'freelancer' ? ' Candidate-se às vagas que mais se adequam ao seu perfil!' : ' Faça login como freelancer para se candidatar.'}
      </p>
    </div>
  );
};

export default JobsHeader;
