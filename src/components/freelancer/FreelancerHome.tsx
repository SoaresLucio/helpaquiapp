
import React from 'react';
import { Star, Clock, DollarSign, Calendar, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { currentUser } from '@/data/mockData';

const FreelancerHome: React.FC = () => {
  const navigate = useNavigate();
  
  // Mock data - in a real app, this would come from the API
  const stats = {
    completedJobs: 47,
    averageRating: 4.8,
    totalEarnings: 'R$ 12.450',
    pendingRequests: 3,
    responseTime: '2h',
    responseRate: 98
  };

  const recentJobs = [
    {
      id: '1',
      title: 'Instalação elétrica residencial',
      client: 'Maria Silva',
      date: '2024-01-15',
      status: 'completed',
      rating: 5,
      amount: 'R$ 350'
    },
    {
      id: '2',
      title: 'Reparo de torneira',
      client: 'João Santos',
      date: '2024-01-12',
      status: 'completed',
      rating: 4.5,
      amount: 'R$ 120'
    },
    {
      id: '3',
      title: 'Limpeza residencial',
      client: 'Ana Costa',
      date: '2024-01-10',
      status: 'pending',
      rating: null,
      amount: 'R$ 200'
    }
  ];

  const categories = currentUser.categories || ['eletrica', 'hidraulica'];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Bem-vindo de volta, {currentUser.name}! 👋
        </h1>
        <p className="text-blue-100 mb-4">
          Você tem {stats.pendingRequests} novas solicitações de serviço
        </p>
        <Button variant="secondary" onClick={() => navigate('/jobs')}>
          Ver Solicitações
        </Button>
      </div>

      {/* Stats Cards */}
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
              Baseado em {currentUser.reviews.length} avaliações
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

      {/* Categories and Services */}
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
            {categories.map(categoryId => {
              const category = currentUser.categories?.find(c => c === categoryId);
              return (
                <Badge key={categoryId} variant="secondary">
                  {categoryId}
                </Badge>
              );
            })}
          </div>
          <Button variant="outline" onClick={() => navigate('/profile')}>
            Gerenciar Serviços
          </Button>
        </CardContent>
      </Card>

      {/* Recent Jobs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Trabalhos Recentes
          </CardTitle>
          <CardDescription>
            Histórico dos seus últimos trabalhos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentJobs.map(job => (
              <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{job.title}</h4>
                  <p className="text-sm text-gray-500">Cliente: {job.client}</p>
                  <p className="text-xs text-gray-400">{job.date}</p>
                </div>
                
                <div className="text-right">
                  <p className="font-medium text-green-600">{job.amount}</p>
                  {job.rating && (
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs ml-1">{job.rating}</span>
                    </div>
                  )}
                  <Badge 
                    variant={job.status === 'completed' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {job.status === 'completed' ? 'Concluído' : 'Pendente'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          
          <Button variant="outline" className="w-full mt-4">
            Ver Todos os Trabalhos
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FreelancerHome;
