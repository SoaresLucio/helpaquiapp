
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Clock, DollarSign, Calendar } from 'lucide-react';

interface FreelancerStatsCardsProps {
  stats: {
    completedJobs: number;
    averageRating: number;
    totalEarnings: string;
    pendingRequests: number;
    responseTime: string;
    responseRate: number;
  };
}

const FreelancerStatsCards: React.FC<FreelancerStatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Trabalhos Concluídos</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completedJobs}</div>
          <p className="text-xs text-muted-foreground">
            +12% desde o mês passado
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
          <Star className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center">
            {stats.averageRating}
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 ml-1" />
          </div>
          <p className="text-xs text-muted-foreground">
            Baseado em avaliações recentes
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ganhos Totais</CardTitle>
          <DollarSign className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.totalEarnings}</div>
          <p className="text-xs text-muted-foreground">
            Este mês: R$ 2.340
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tempo de Resposta</CardTitle>
          <Clock className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.responseTime}</div>
          <p className="text-xs text-muted-foreground">
            {stats.responseRate}% de taxa de resposta
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FreelancerStatsCards;
