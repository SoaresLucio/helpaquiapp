
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FreelancerCategoriesCardProps {
  userCategories: string[];
}

const FreelancerCategoriesCard: React.FC<FreelancerCategoriesCardProps> = ({ userCategories }) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Suas Categorias de Serviço
        </CardTitle>
        <CardDescription>
          Categorias em que você atua como freelancer
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {userCategories.map((categoryId: string, index: number) => (
            <Badge key={index} variant="secondary">
              {categoryId}
            </Badge>
          ))}
        </div>
        <Button variant="outline" onClick={() => navigate('/profile')}>
          Gerenciar Serviços
        </Button>
      </CardContent>
    </Card>
  );
};

export default FreelancerCategoriesCard;
