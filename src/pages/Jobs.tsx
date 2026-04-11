
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import BackButton from '@/components/ui/back-button';
import JobApplicationDialog from '@/components/jobs/JobApplicationDialog';
import JobsHeader from '@/components/jobs/JobsHeader';
import JobsLoading from '@/components/jobs/JobsLoading';
import JobsEmpty from '@/components/jobs/JobsEmpty';
import JobsList from '@/components/jobs/JobsList';

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
      setJobs((data || []) as JobListing[]);
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

  const canApply = isAuthenticated && userType === 'freelancer';

  if (loading) {
    return <JobsLoading />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <BackButton to="/dashboard" label="Voltar ao Início" />
        </div>

        <JobsHeader userType={userType} />

        {jobs.length === 0 ? (
          <JobsEmpty />
        ) : (
          <JobsList 
            jobs={jobs}
            onApplyClick={handleApplyClick}
            canApply={canApply}
          />
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
    </div>
  );
};

export default Jobs;
