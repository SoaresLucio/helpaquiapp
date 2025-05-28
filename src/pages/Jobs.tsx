
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Filter, Briefcase } from 'lucide-react';
import { getServiceRequests, getServiceRequestsByCategory } from '@/services/jobsService';
import JobCard from '@/components/jobs/JobCard';
import JobsMap from '@/components/jobs/JobsMap';
import { getUserType } from '@/services/authService';
import { useNavigate } from 'react-router-dom';

const Jobs = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [userType, setUserType] = useState<'solicitante' | 'freelancer'>('freelancer');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserType = async () => {
      try {
        const type = await getUserType();
        setUserType(type || 'freelancer');
        
        // Redirect if user is not a freelancer
        if (type === 'solicitante') {
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching user type:', error);
      }
    };

    fetchUserType();
  }, [navigate]);

  const { data: jobs = [], isLoading, refetch } = useQuery({
    queryKey: ['service-requests', selectedCategory],
    queryFn: () => selectedCategory ? getServiceRequestsByCategory(selectedCategory) : getServiceRequests(),
  });

  const categories = [
    { id: 'limpeza', name: 'Limpeza', icon: '🧹' },
    { id: 'eletrica', name: 'Elétrica', icon: '⚡' },
    { id: 'hidraulica', name: 'Hidráulica', icon: '🔧' },
    { id: 'pintura', name: 'Pintura', icon: '🎨' },
    { id: 'jardinagem', name: 'Jardinagem', icon: '🌱' },
    { id: 'cozinha', name: 'Cozinha', icon: '👩‍🍳' },
    { id: 'montagem', name: 'Montagem', icon: '🔨' },
    { id: 'transporte', name: 'Transporte', icon: '🚗' }
  ];

  // Filter and sort jobs
  const filteredJobs = jobs
    .filter(job => 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'budget_high':
          return (b.budget_max || 0) - (a.budget_max || 0);
        case 'budget_low':
          return (a.budget_min || 0) - (b.budget_min || 0);
        default:
          return 0;
      }
    });

  if (userType === 'solicitante') {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="helpaqui-container py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-helpaqui-blue flex items-center gap-2 mb-2">
            <Briefcase className="h-8 w-8" />
            Solicitações de Serviço
          </h1>
          <p className="text-gray-600">
            Encontre trabalhos próximos a você e envie suas propostas
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por título, descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Categoria</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as categorias</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Ordenar por</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Mais recentes</SelectItem>
                    <SelectItem value="oldest">Mais antigos</SelectItem>
                    <SelectItem value="budget_high">Maior orçamento</SelectItem>
                    <SelectItem value="budget_low">Menor orçamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Category buttons */}
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === '' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('')}
                >
                  Todas
                </Button>
                {categories.map(category => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.icon} {category.name}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Lista de Trabalhos
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Mapa
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="list">
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-helpaqui-blue mx-auto"></div>
                  <p className="mt-2 text-gray-600">Carregando trabalhos...</p>
                </div>
              ) : filteredJobs.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum trabalho encontrado
                    </h3>
                    <p className="text-gray-600">
                      {searchTerm || selectedCategory 
                        ? 'Tente ajustar seus filtros de busca'
                        : 'Não há solicitações de serviço disponíveis no momento'
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      {filteredJobs.length} trabalho{filteredJobs.length !== 1 ? 's' : ''} encontrado{filteredJobs.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredJobs.map(job => (
                      <JobCard 
                        key={job.id} 
                        job={job}
                        onProposalSubmitted={() => refetch()}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="map">
            <JobsMap 
              jobs={filteredJobs}
              selectedCategory={selectedCategory}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Jobs;
