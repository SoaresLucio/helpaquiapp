
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
import PageSEO from '@/components/common/PageSEO';

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

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase.from('job_listings').select('*').eq('is_active', true).order('created_at', { ascending: false });
      if (error) throw error;
      setJobs((data || []) as JobListing[]);
    } catch (error: any) {
      toast({ title: "Erro ao carregar vagas", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = (job: JobListing) => {
    if (!isAuthenticated) { toast({ title: "Login necessário", description: "Faça login para se candidatar.", variant: "destructive" }); return; }
    if (userType !== 'freelancer') { toast({ title: "Acesso restrito", description: "Apenas freelancers podem se candidatar.", variant: "destructive" }); return; }
    setSelectedJob(job);
    setIsApplicationDialogOpen(true);
  };

  const handleApplicationSuccess = () => {
    setIsApplicationDialogOpen(false);
    setSelectedJob(null);
    toast({ title: "Candidatura enviada!", description: "A empresa entrará em contato em breve." });
  };

  if (loading) return (
    <PageSEO title="Vagas de Emprego" description="Encontre vagas de emprego para freelancers e profissionais qualificados na HelpAqui." path="/jobs">
      <JobsLoading />
    </PageSEO>
  );

  return (
    <PageSEO
      title="Vagas de Emprego"
      description="Encontre vagas de emprego para freelancers e profissionais qualificados na HelpAqui."
      path="/jobs"
    >
    <div className="min-h-screen bg-background">
      <Header />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <BackButton to="/dashboard" label="Voltar ao Início" />
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <JobsHeader userType={userType} />
        </motion.div>
        {jobs.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
            <JobsEmpty />
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <JobsList jobs={jobs} onApplyClick={handleApplyClick} canApply={isAuthenticated && userType === 'freelancer'} />
          </motion.div>
        )}
        {selectedJob && (
          <JobApplicationDialog job={selectedJob} isOpen={isApplicationDialogOpen} onClose={() => { setIsApplicationDialogOpen(false); setSelectedJob(null); }} onSuccess={handleApplicationSuccess} />
        )}
      </motion.div>
    </div>
  );
};

export default Jobs;
