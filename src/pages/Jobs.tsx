
import React, { useState } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, Search, MapPin, DollarSign, Calendar, Building, Plus, Filter, ArrowUpDown } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { serviceCategories } from '@/data/mockData';

// Mock job data
const mockJobs = [
  {
    id: '1',
    title: 'Eletricista para Instalação Comercial',
    company: 'Construtora Silva Ltda',
    location: 'São Paulo, SP',
    category: 'Reparos',
    type: 'Tempo integral',
    salary: 'R$ 3.000 - R$ 4.500',
    postedDate: '2023-04-01',
    logo: 'https://via.placeholder.com/50',
    description: 'Procuramos eletricista com experiência em instalações comerciais para trabalhar em tempo integral. Necessário conhecimento em instalações elétricas de baixa e média tensão.',
  },
  {
    id: '2',
    title: 'Encanador para Manutenção Predial',
    company: 'Condomínio Central',
    location: 'Rio de Janeiro, RJ',
    category: 'Reparos',
    type: 'Tempo integral',
    salary: 'R$ 2.800 - R$ 3.800',
    postedDate: '2023-04-02',
    logo: 'https://via.placeholder.com/50',
    description: 'Vaga para encanador com experiência em manutenção de instalações hidráulicas prediais. Necessário conhecimento em reparos de tubulações e sistemas de água.',
  },
  {
    id: '3',
    title: 'Auxiliar de Limpeza',
    company: 'Limpe Bem Serviços',
    location: 'Belo Horizonte, MG',
    category: 'Limpeza',
    type: 'Tempo integral',
    salary: 'R$ 1.800 - R$ 2.200',
    postedDate: '2023-04-03',
    logo: 'https://via.placeholder.com/50',
    description: 'Contratamos auxiliar de limpeza para atuar em escritórios empresariais. Horário comercial de segunda a sexta.',
  },
  {
    id: '4',
    title: 'Motoboy Entregador',
    company: 'Entrega Express',
    location: 'São Paulo, SP',
    category: 'Entregas',
    type: 'Tempo integral',
    salary: 'R$ 2.000 - R$ 3.000',
    postedDate: '2023-04-04',
    logo: 'https://via.placeholder.com/50',
    description: 'Precisamos de motociclistas para entrega de documentos e pequenos volumes na região metropolitana. Necessário possuir moto própria e CNH categoria A.',
  },
  {
    id: '5',
    title: 'Assistente Administrativo',
    company: 'Escritório Contábil Garcia',
    location: 'Curitiba, PR',
    category: 'Escritório',
    type: 'Tempo integral',
    salary: 'R$ 2.200 - R$ 2.800',
    postedDate: '2023-04-05',
    logo: 'https://via.placeholder.com/50',
    description: 'Vaga para assistente administrativo com experiência em atendimento ao cliente e rotinas administrativas. Conhecimento em Excel é um diferencial.',
  },
];

const Jobs = () => {
  const { toast } = useToast();
  const [jobs, setJobs] = useState(mockJobs);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    category: '',
    type: 'Tempo integral',
    salary: '',
    description: '',
  });
  
  const filteredJobs = jobs
    .filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory ? job.category === selectedCategory : true;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
      } else {
        return new Date(a.postedDate).getTime() - new Date(b.postedDate).getTime();
      }
    });
  
  const handleInputChange = (field: string, value: string) => {
    setNewJob(prev => ({ ...prev, [field]: value }));
  };
  
  const handlePostJob = (event: React.FormEvent, onClose: () => void) => {
    event.preventDefault();
    
    const newJobEntry = {
      ...newJob,
      id: (jobs.length + 1).toString(),
      postedDate: new Date().toISOString().split('T')[0],
      logo: 'https://via.placeholder.com/50',
    };
    
    setJobs(prev => [newJobEntry, ...prev]);
    
    toast({
      title: "Vaga publicada com sucesso!",
      description: "Sua vaga de emprego foi publicada e já está disponível.",
    });
    
    setNewJob({
      title: '',
      company: '',
      location: '',
      category: '',
      type: 'Tempo integral',
      salary: '',
      description: '',
    });
    
    onClose();
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      
      <main className="flex-1 helpaqui-container py-4">
        <div className="flex flex-col md:flex-row items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Vagas de Emprego</h1>
            <p className="text-gray-600">
              Encontre oportunidades de trabalho em tempo integral
            </p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="mt-4 md:mt-0 helpaqui-button-primary">
                <Plus className="mr-2 h-4 w-4" />
                Publicar Vaga
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Publicar nova vaga de emprego</DialogTitle>
                <DialogDescription>
                  Preencha os detalhes da vaga que você deseja publicar.
                </DialogDescription>
              </DialogHeader>
              
              {(onClose) => (
                <form onSubmit={(e) => handlePostJob(e, onClose)}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="job-title">Título da vaga</Label>
                        <Input 
                          id="job-title" 
                          value={newJob.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="job-company">Empresa</Label>
                        <Input 
                          id="job-company" 
                          value={newJob.company}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="job-location">Localização</Label>
                        <Input 
                          id="job-location" 
                          placeholder="Cidade, Estado"
                          value={newJob.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="job-category">Categoria</Label>
                        <Select 
                          value={newJob.category}
                          onValueChange={(value) => handleInputChange('category', value)}
                          required
                        >
                          <SelectTrigger id="job-category">
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {serviceCategories.map(category => (
                              <SelectItem key={category.id} value={category.name}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="job-type">Tipo de contrato</Label>
                        <Select 
                          value={newJob.type}
                          onValueChange={(value) => handleInputChange('type', value)}
                          required
                        >
                          <SelectTrigger id="job-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Tempo integral">Tempo integral</SelectItem>
                            <SelectItem value="Meio período">Meio período</SelectItem>
                            <SelectItem value="Temporário">Temporário</SelectItem>
                            <SelectItem value="Estágio">Estágio</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="job-salary">Faixa salarial</Label>
                        <Input 
                          id="job-salary" 
                          placeholder="R$ 0.000 - R$ 0.000"
                          value={newJob.salary}
                          onChange={(e) => handleInputChange('salary', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="job-description">Descrição da vaga</Label>
                      <textarea 
                        id="job-description" 
                        className="flex h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Descreva os requisitos, responsabilidades e benefícios da vaga"
                        value={newJob.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button type="submit">Publicar vaga</Button>
                  </DialogFooter>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar com filtros */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-medium mb-4">Filtros</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="search-jobs">Buscar vagas</Label>
                <div className="relative mt-1">
                  <Input
                    id="search-jobs"
                    type="text"
                    placeholder="Buscar por título ou empresa"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                  <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="category-filter">Categoria</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger id="category-filter">
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as categorias</SelectItem>
                    {serviceCategories.map(category => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="sort-order">Ordenar por</Label>
                <Select
                  value={sortOrder}
                  onValueChange={(value: 'newest' | 'oldest') => setSortOrder(value)}
                >
                  <SelectTrigger id="sort-order">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Mais recentes</SelectItem>
                    <SelectItem value="oldest">Mais antigas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                    setSortOrder('newest');
                  }}
                >
                  Limpar filtros
                </Button>
              </div>
            </div>
          </div>
          
          {/* Lista de vagas */}
          <div className="md:col-span-3">
            {filteredJobs.length > 0 ? (
              <div className="space-y-4">
                {filteredJobs.map(job => (
                  <Card key={job.id} className="border-none shadow-sm hover:shadow transition-shadow">
                    <CardContent className="p-0">
                      <div className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 shrink-0 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                            <img src={job.logo} alt={job.company} className="w-full h-full object-cover" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-lg">{job.title}</h3>
                                <div className="flex items-center text-sm text-gray-600 mt-1">
                                  <Building className="h-4 w-4 mr-1" />
                                  {job.company}
                                </div>
                              </div>
                              
                              <Badge variant="secondary" className="shrink-0">
                                {job.type}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 mt-4">
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="h-4 w-4 mr-1 text-helpaqui-blue" />
                                {job.location}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <DollarSign className="h-4 w-4 mr-1 text-helpaqui-green" />
                                {job.salary}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Briefcase className="h-4 w-4 mr-1 text-helpaqui-darkGray" />
                                {job.category}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="h-4 w-4 mr-1 text-helpaqui-darkGray" />
                                {new Date(job.postedDate).toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 mt-4">
                              {job.description}
                            </p>
                            
                            <div className="mt-4">
                              <Button>Ver detalhes e aplicar</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">Nenhuma vaga encontrada</h3>
                <p className="mt-2 text-gray-500">
                  Tente ajustar seus filtros ou busque por outros termos.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Jobs;
