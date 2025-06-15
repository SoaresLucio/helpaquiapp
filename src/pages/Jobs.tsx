
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Building, Clock, DollarSign, FileText, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import JobApplicationDialog from '@/components/jobs/JobApplicationDialog';

interface JobListing {
  id: string;
  title: string;
  company_name: string;
  company_email: string;
  description: string;
  job_type: 'CLT' | 'temporario';
  location: string;
  salary_range: string;
  requirements: string;
  benefits: string;
  created_at: string;
}

const Jobs = () => {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated, userType } = useAuth();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('job_listings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar vagas",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = (job: JobListing) => {
    if (!isAuthenticated) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para se candidatar a vagas.",
        variant: "destructive"
      });
      return;
    }

    if (userType !== 'freelancer') {
      toast({
        title: "Acesso restrito",
        description: "Apenas freelancers podem se candidatar a vagas.",
        variant: "destructive"
      });
      return;
    }

    setSelectedJob(job);
    setIsApplicationDialogOpen(true);
  };

  const handleApplicationSuccess = () => {
    setIsApplicationDialogOpen(false);
    setSelectedJob(null);
    toast({
      title: "Candidatura enviada!",
      description: "Sua candidatura foi enviada com sucesso. A empresa entrará em contato em breve.",
    });
  };

  const getJobTypeLabel = (type: string) => {
    return type === 'CLT' ? 'CLT' : 'Temporário';
  };

  const getJobTypeBadgeVariant = (type: string) => {
    return type === 'CLT' ? 'default' : 'secondary';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-helpaqui-blue"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Vagas de Emprego</h1>
        <p className="text-gray-600">
          Encontre oportunidades de trabalho CLT e temporárias. 
          {userType === 'freelancer' ? ' Candidate-se às vagas que mais se adequam ao seu perfil!' : ' Faça login como freelancer para se candidatar.'}
        </p>
      </div>

      {jobs.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma vaga disponível</h3>
            <p className="text-gray-600">Não há vagas de emprego disponíveis no momento. Volte em breve!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        <span>{job.company_name}</span>
                      </div>
                      {job.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(job.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant={getJobTypeBadgeVariant(job.job_type)}>
                        {getJobTypeLabel(job.job_type)}
                      </Badge>
                      {job.salary_range && (
                        <div className="flex items-center gap-1 text-sm text-green-600 font-medium">
                          <DollarSign className="h-4 w-4" />
                          <span>{job.salary_range}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleApplyClick(job)}
                    disabled={!isAuthenticated || userType !== 'freelancer'}
                  >
                    Candidatar-se
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                {job.description && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Descrição da Vaga</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">{job.description}</p>
                  </div>
                )}

                {job.requirements && (
                  <>
                    <Separator className="my-4" />
                    <div className="mb-4">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Requisitos
                      </h4>
                      <p className="text-gray-700 text-sm leading-relaxed">{job.requirements}</p>
                    </div>
                  </>
                )}

                {job.benefits && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <h4 className="font-medium mb-2">Benefícios</h4>
                      <p className="text-gray-700 text-sm leading-relaxed">{job.benefits}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedJob && (
        <JobApplicationDialog
          job={selectedJob}
          isOpen={isApplicationDialogOpen}
          onClose={() => {
            setIsApplicationDialogOpen(false);
            setSelectedJob(null);
          }}
          onSuccess={handleApplicationSuccess}
        />
      )}
    </div>
  );
};

export default Jobs;
