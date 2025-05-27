import React, { useState } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, 
  Filter, 
  Plus, 
  PenLine, 
  Trash, 
  Briefcase,
  Clock,
  CalendarDays,
  MapPin,
  Building,
  DollarSign,
  FileText,
  Send
} from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Type definitions
type Job = {
  id: string;
  title: string;
  company: string;
  type: string;
  location: string;
  category: string;
  salary: string;
  description: string;
  requirements: string;
  datePosted: string;
};

// Mock data
const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Desenvolvedor Frontend Senior',
    company: 'Tech Solutions Inc.',
    type: 'Tempo integral',
    location: 'São Paulo, SP',
    category: 'Tecnologia',
    salary: 'R$ 8.000 - R$ 12.000',
    description: 'Responsável por desenvolver e manter interfaces web responsivas e eficientes. Trabalhar em equipe ágil com designers e desenvolvedores backend.',
    requirements: 'Experiência com React, Angular ou Vue.js, HTML, CSS e JavaScript. Conhecimento em TypeScript é um diferencial.',
    datePosted: '2024-08-01'
  },
  {
    id: '2',
    title: 'Analista de Marketing Digital',
    company: 'Creative Agency',
    type: 'Tempo integral',
    location: 'Rio de Janeiro, RJ',
    category: 'Marketing',
    salary: 'R$ 5.000 - R$ 7.000',
    description: 'Responsável por planejar e executar campanhas de marketing digital. Análise de métricas e ROI das campanhas.',
    requirements: 'Experiência com Google Ads, SEO, redes sociais e análise de dados. Conhecimento em Google Analytics.',
    datePosted: '2024-07-25'
  },
  {
    id: '3',
    title: 'Designer UX/UI',
    company: 'Innovation Labs',
    type: 'Tempo integral',
    location: 'Belo Horizonte, MG',
    category: 'Design',
    salary: 'R$ 6.000 - R$ 9.000',
    description: 'Responsável por criar interfaces de usuário intuitivas e agradáveis. Pesquisa de usuário e prototipagem.',
    requirements: 'Experiência com Figma, Adobe XD e design thinking. Portfolio sólido é obrigatório.',
    datePosted: '2024-07-20'
  },
];

const Jobs = () => {
  const { toast } = useToast();
  const [jobs, setJobs] = useState(mockJobs);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todas');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applicationData, setApplicationData] = useState({
    name: '',
    email: '',
    phone: '',
    coverLetter: '',
    experience: ''
  });

  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    type: '',
    location: '',
    category: '',
    salary: '',
    description: '',
    requirements: '',
    datePosted: ''
  });

  // Filtered jobs based on search term and category
  const filteredJobs = jobs.filter(job => {
    const searchTermMatch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch =
      filterCategory === 'Todas' || job.category === filterCategory;
    return searchTermMatch && categoryMatch;
  });

  // Handle job submission
  const handleSubmitJob = (event: React.FormEvent, onClose: () => void) => {
    event.preventDefault();

    const newJobEntry: Job = {
      id: Date.now().toString(),
      title: newJob.title,
      company: newJob.company,
      type: newJob.type,
      location: newJob.location,
      category: newJob.category,
      salary: newJob.salary,
      description: newJob.description,
      requirements: newJob.requirements,
      datePosted: new Date().toISOString().slice(0, 10)
    };

    setJobs(prev => [...prev, newJobEntry]);

    setNewJob({
      title: '',
      company: '',
      type: '',
      location: '',
      category: '',
      salary: '',
      description: '',
      requirements: '',
      datePosted: ''
    });

    toast({
      title: "Vaga publicada",
      description: `A vaga "${newJob.title}" foi publicada com sucesso.`,
    });

    onClose();
  };

  // Handle job application
  const handleJobApplication = (event: React.FormEvent, onClose: () => void) => {
    event.preventDefault();

    // Simular envio do currículo por email
    const emailContent = `
      Nova candidatura para: ${selectedJob?.title}
      
      Nome: ${applicationData.name}
      Email: ${applicationData.email}
      Telefone: ${applicationData.phone}
      
      Carta de Apresentação:
      ${applicationData.coverLetter}
      
      Experiência:
      ${applicationData.experience}
    `;

    console.log('Enviando currículo para helpaquiapp@hotmail.com:', emailContent);

    toast({
      title: "Candidatura enviada!",
      description: `Seu currículo foi enviado para a vaga "${selectedJob?.title}". Entraremos em contato em breve.`,
    });

    setApplicationData({
      name: '',
      email: '',
      phone: '',
      coverLetter: '',
      experience: ''
    });

    onClose();
  };

  // Job Details Dialog Component
  const JobDetailsDialog = ({ job }: { job: Job }) => {
    return (
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{job.title}</DialogTitle>
          <DialogDescription className="text-base text-gray-600">
            {job.company} • {job.location}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4 text-gray-500" />
              <span>{job.type}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span>{job.salary}</span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Descrição da Vaga</h3>
            <p className="text-gray-700 leading-relaxed">{job.description}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Requisitos</h3>
            <p className="text-gray-700 leading-relaxed">{job.requirements}</p>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <CalendarDays className="h-4 w-4" />
            <span>Publicado em: {new Date(job.datePosted).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <DialogClose asChild>
            <Button variant="outline">Fechar</Button>
          </DialogClose>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <FileText className="mr-2 h-4 w-4" />
                Candidatar-se
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Candidatar-se para: {job.title}</DialogTitle>
                <DialogDescription>
                  Preencha seus dados para enviar sua candidatura. Seu currículo será enviado para nossa equipe de recrutamento.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={(e) => {
                const closeDialog = () => {
                  document.querySelector<HTMLButtonElement>('[data-id="close-application-dialog"]')?.click();
                };
                handleJobApplication(e, closeDialog);
              }}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="applicant-name">Nome Completo</Label>
                    <Input 
                      id="applicant-name" 
                      placeholder="Seu nome completo"
                      value={applicationData.name}
                      onChange={(e) => setApplicationData({...applicationData, name: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="applicant-email">Email</Label>
                      <Input 
                        id="applicant-email" 
                        type="email"
                        placeholder="seu@email.com"
                        value={applicationData.email}
                        onChange={(e) => setApplicationData({...applicationData, email: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="applicant-phone">Telefone</Label>
                      <Input 
                        id="applicant-phone" 
                        placeholder="(11) 99999-9999"
                        value={applicationData.phone}
                        onChange={(e) => setApplicationData({...applicationData, phone: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cover-letter">Carta de Apresentação</Label>
                    <Textarea 
                      id="cover-letter" 
                      rows={4}
                      placeholder="Conte-nos por que você é o candidato ideal para esta vaga..."
                      value={applicationData.coverLetter}
                      onChange={(e) => setApplicationData({...applicationData, coverLetter: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="experience">Experiência Relevante</Label>
                    <Textarea 
                      id="experience" 
                      rows={3}
                      placeholder="Descreva sua experiência relevante para esta posição..."
                      value={applicationData.experience}
                      onChange={(e) => setApplicationData({...applicationData, experience: e.target.value})}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <DialogClose asChild>
                    <Button data-id="close-application-dialog" type="button" variant="outline">Cancelar</Button>
                  </DialogClose>
                  <Button type="submit">
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Candidatura
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </DialogFooter>
      </DialogContent>
    );
  };

  // Job Form component
  const JobForm = () => {
    return (
      <form onSubmit={(e) => {
        const closeDialog = () => {
          document.querySelector<HTMLButtonElement>('[data-id="close-job-dialog"]')?.click();
        };
        handleSubmitJob(e, closeDialog);
      }}>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="job-title">Título da vaga</Label>
            <Input 
              id="job-title" 
              placeholder="Ex: Desenvolvedor Frontend Senior"
              value={newJob.title}
              onChange={(e) => setNewJob({...newJob, title: e.target.value})}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="job-company">Empresa</Label>
            <Input 
              id="job-company" 
              placeholder="Ex: Tech Solutions Inc."
              value={newJob.company}
              onChange={(e) => setNewJob({...newJob, company: e.target.value})}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="job-type">Tipo de contratação</Label>
              <Select 
                value={newJob.type}
                onValueChange={(value) => setNewJob({...newJob, type: value})}
              >
                <SelectTrigger id="job-type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tempo integral">Tempo integral</SelectItem>
                  <SelectItem value="Meio período">Meio período</SelectItem>
                  <SelectItem value="Freelancer">Freelancer</SelectItem>
                  <SelectItem value="Estágio">Estágio</SelectItem>
                  <SelectItem value="Temporário">Temporário</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="job-location">Localização</Label>
              <Input 
                id="job-location" 
                placeholder="Ex: São Paulo, SP"
                value={newJob.location}
                onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="job-category">Categoria</Label>
              <Select 
                value={newJob.category}
                onValueChange={(value) => setNewJob({...newJob, category: value})}
              >
                <SelectTrigger id="job-category">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Vendas">Vendas</SelectItem>
                  <SelectItem value="Administrativo">Administrativo</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="job-salary">Faixa salarial</Label>
              <Input 
                id="job-salary" 
                placeholder="Ex: R$ 5.000 - R$ 7.000"
                value={newJob.salary}
                onChange={(e) => setNewJob({...newJob, salary: e.target.value})}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="job-description">Descrição da vaga</Label>
            <Textarea 
              id="job-description" 
              rows={5}
              placeholder="Descreva as responsabilidades, requisitos e benefícios da vaga..."
              value={newJob.description}
              onChange={(e) => setNewJob({...newJob, description: e.target.value})}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="job-requirements">Requisitos</Label>
            <Textarea 
              id="job-requirements" 
              rows={3}
              placeholder="Liste os requisitos necessários para a vaga..."
              value={newJob.requirements}
              onChange={(e) => setNewJob({...newJob, requirements: e.target.value})}
            />
          </div>
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button data-id="close-job-dialog" type="button" variant="outline">Cancelar</Button>
          </DialogClose>
          <Button type="submit">Publicar vaga</Button>
        </DialogFooter>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      
      <main className="flex-1 helpaqui-container py-4">
        <div className="flex flex-col md:flex-row items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Vagas de Trabalho</h1>
            <p className="text-gray-600">
              Encontre as melhores oportunidades de emprego ou publique uma nova vaga
            </p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="mt-4 md:mt-0 helpaqui-button-primary">
                <Plus className="mr-2 h-4 w-4" />
                Publicar Vaga
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Publicar nova vaga</DialogTitle>
                <DialogDescription>
                  Preencha os detalhes da vaga de emprego que você deseja publicar.
                </DialogDescription>
              </DialogHeader>
              
              <JobForm />
            </DialogContent>
          </Dialog>
        </div>
        
        <Card className="mb-6">
          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
              <div className="w-full md:flex-1 relative">
                <Input
                  placeholder="Buscar vagas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              </div>
              <div className="flex items-center space-x-2">
                <Select
                  value={filterCategory}
                  onValueChange={setFilterCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todas">Todas</SelectItem>
                    <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Vendas">Vendas</SelectItem>
                    <SelectItem value="Administrativo">Administrativo</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredJobs.map(job => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    <CardDescription className="text-base">{job.company}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Briefcase className="h-4 w-4" />
                      <span>{job.type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <DollarSign className="h-4 w-4" />
                      <span>{job.salary}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full"
                          onClick={() => setSelectedJob(job)}
                        >
                          Ver Detalhes
                        </Button>
                      </DialogTrigger>
                      {selectedJob && <JobDetailsDialog job={selectedJob} />}
                    </Dialog>
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                      <CalendarDays className="h-3 w-3" />
                      <span>Publicado em: {new Date(job.datePosted).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Jobs;
