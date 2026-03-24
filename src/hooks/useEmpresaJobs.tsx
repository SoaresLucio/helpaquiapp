
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

interface JobListing {
  id: string;
  title: string;
  company_name: string;
  company_email: string;
  description: string | null;
  job_type: string;
  location: string | null;
  salary_range: string | null;
  requirements: string | null;
  benefits: string | null;
  is_active: boolean;
  created_at: string;
  owner_id: string | null;
}

interface JobApplication {
  id: string;
  job_listing_id: string | null;
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string | null;
  message: string | null;
  resume_url: string;
  created_at: string;
}

export function useEmpresaJobs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [applications, setApplications] = useState<Record<string, JobApplication[]>>({});
  const [loading, setLoading] = useState(true);
  const [companyInfo, setCompanyInfo] = useState<{ company_name: string; cnpj: string } | null>(null);

  const fetchJobs = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('job_listings')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs((data || []) as JobListing[]);

      if (data && data.length > 0) {
        const { data: apps } = await supabase
          .from('job_applications')
          .select('*')
          .in('job_listing_id', data.map(j => j.id))
          .order('created_at', { ascending: false });

        if (apps) {
          const grouped: Record<string, JobApplication[]> = {};
          apps.forEach((app: any) => {
            const jid = app.job_listing_id;
            if (!grouped[jid]) grouped[jid] = [];
            grouped[jid].push(app as JobApplication);
          });
          setApplications(grouped);
        }
      }
    } catch (error: any) {
      toast({ title: "Erro ao carregar vagas", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      supabase.from('empresa_profiles').select('company_name, cnpj').eq('user_id', user.id).maybeSingle()
        .then(({ data }) => { if (data) setCompanyInfo(data); });
      fetchJobs();
    }
  }, [user, fetchJobs]);

  const saveJob = async (formData: any, editingJobId?: string) => {
    if (!user) return false;
    try {
      const profile = await supabase.from('profiles').select('email').eq('id', user.id).single();
      const payload = {
        ...formData,
        description: formData.description || null,
        location: formData.location || null,
        salary_range: formData.salary_range || null,
        requirements: formData.requirements || null,
        benefits: formData.benefits || null,
        company_name: companyInfo?.company_name || 'Empresa',
        company_email: profile.data?.email || '',
        owner_id: user.id,
        is_active: true,
      };

      if (editingJobId) {
        const { error } = await supabase.from('job_listings').update(payload).eq('id', editingJobId).eq('owner_id', user.id);
        if (error) throw error;
        toast({ title: "Vaga atualizada com sucesso!" });
      } else {
        const { error } = await supabase.from('job_listings').insert(payload);
        if (error) throw error;
        toast({ title: "Vaga criada com sucesso!" });
      }
      fetchJobs();
      return true;
    } catch (error: any) {
      toast({ title: "Erro ao salvar vaga", description: error.message, variant: "destructive" });
      return false;
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!user || !confirm('Tem certeza que deseja excluir esta vaga?')) return;
    try {
      const { error } = await supabase.from('job_listings').delete().eq('id', jobId).eq('owner_id', user.id);
      if (error) throw error;
      toast({ title: "Vaga excluída com sucesso!" });
      fetchJobs();
    } catch (error: any) {
      toast({ title: "Erro ao excluir vaga", description: error.message, variant: "destructive" });
    }
  };

  const toggleActive = async (job: JobListing) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('job_listings').update({ is_active: !job.is_active }).eq('id', job.id).eq('owner_id', user.id);
      if (error) throw error;
      toast({ title: job.is_active ? "Vaga desativada" : "Vaga ativada" });
      fetchJobs();
    } catch (error: any) {
      toast({ title: "Erro ao atualizar vaga", description: error.message, variant: "destructive" });
    }
  };

  return { jobs, applications, loading, companyInfo, saveJob, deleteJob, toggleActive, fetchJobs };
}
