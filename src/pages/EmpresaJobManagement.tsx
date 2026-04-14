
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import BackButton from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Plus, Pencil, Trash2, Users, MapPin, Clock, DollarSign, FileText, Download, Eye, Building } from 'lucide-react';

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

const emptyJob = {
  title: '',
  description: '',
  job_type: 'CLT',
  location: '',
  salary_range: '',
  requirements: '',
  benefits: '',
};

const EmpresaJobManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [applications, setApplications] = useState<Record<string, JobApplication[]>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<JobListing | null>(null);
  const [formData, setFormData] = useState(emptyJob);
  const [saving, setSaving] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [companyInfo, setCompanyInfo] = useState<{ company_name: string; cnpj: string } | null>(null);

  useEffect(() => {
    if (user) {
      fetchCompanyInfo();
      fetchJobs();
    }
  }, [user]);

  const fetchCompanyInfo = async () => {
    const { data } = await supabase
      .from('empresa_profiles')
      .select('company_name, cnpj')
      .eq('user_id', user!.id)
      .maybeSingle();
    if (data) setCompanyInfo(data);
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('job_listings')
        .select('*')
        .eq('owner_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs((data || []) as JobListing[]);

      // Fetch applications for all jobs
      if (data && data.length > 0) {
        const jobIds = data.map(j => j.id);
        const { data: apps } = await supabase
          .from('job_applications')
          .select('*')
          .in('job_listing_id', jobIds)
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
  };

  const handleOpenCreate = () => {
    setEditingJob(null);
    setFormData(emptyJob);
    setShowForm(true);
  };

  const handleOpenEdit = (job: JobListing) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      description: job.description || '',
      job_type: job.job_type,
      location: job.location || '',
      salary_range: job.salary_range || '',
      requirements: job.requirements || '',
      benefits: job.benefits || '',
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast({ title: "Título obrigatório", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const profile = await supabase.from('profiles').select('email').eq('id', user!.id).single();
      const companyEmail = profile.data?.email || '';
      const companyName = companyInfo?.company_name || 'Empresa';

      const payload = {
        title: formData.title,
        description: formData.description || null,
        job_type: formData.job_type,
        location: formData.location || null,
        salary_range: formData.salary_range || null,
        requirements: formData.requirements || null,
        benefits: formData.benefits || null,
        company_name: companyName,
        company_email: companyEmail,
        owner_id: user!.id,
        is_active: true,
      };

      if (editingJob) {
        const { error } = await supabase
          .from('job_listings')
          .update(payload)
          .eq('id', editingJob.id)
          .eq('owner_id', user!.id);
        if (error) throw error;
        toast({ title: "Vaga atualizada com sucesso!" });
      } else {
        const { error } = await supabase
          .from('job_listings')
          .insert(payload);
        if (error) throw error;
        toast({ title: "Vaga criada com sucesso!" });
      }

      setShowForm(false);
      fetchJobs();
    } catch (error: any) {
      toast({ title: "Erro ao salvar vaga", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta vaga?')) return;
    try {
      const { error } = await supabase
        .from('job_listings')
        .delete()
        .eq('id', jobId)
        .eq('owner_id', user!.id);
      if (error) throw error;
      toast({ title: "Vaga excluída com sucesso!" });
      fetchJobs();
    } catch (error: any) {
      toast({ title: "Erro ao excluir vaga", description: error.message, variant: "destructive" });
    }
  };

  const handleToggleActive = async (job: JobListing) => {
    try {
      const { error } = await supabase
        .from('job_listings')
        .update({ is_active: !job.is_active })
        .eq('id', job.id)
        .eq('owner_id', user!.id);
      if (error) throw error;
      toast({ title: job.is_active ? "Vaga desativada" : "Vaga ativada" });
      fetchJobs();
    } catch (error: any) {
      toast({ title: "Erro ao atualizar vaga", description: error.message, variant: "destructive" });
    }
  };

  const getResumeUrl = (path: string) => {
    const { data } = supabase.storage.from('resumes').getPublicUrl(path);
    return data.publicUrl;
  };

  const jobApps = selectedJobId ? (applications[selectedJobId] || []) : [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-6">
          <BackButton to="/" label="Voltar ao Início" />
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Building className="h-7 w-7 text-primary" />
              Gerenciar Vagas de Emprego
            </h1>
            {companyInfo && (
              <p className="text-muted-foreground text-sm mt-1">{companyInfo.company_name}</p>
            )}
          </div>
          <Button onClick={handleOpenCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Nova Vaga
          </Button>
        </div>

        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList>
            <TabsTrigger value="jobs">Minhas Vagas ({jobs.length})</TabsTrigger>
            <TabsTrigger value="candidates">Candidatos</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
              </div>
            ) : jobs.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma vaga criada</h3>
                  <p className="text-muted-foreground mb-4">Crie sua primeira vaga de emprego para começar a receber candidatos.</p>
                  <Button onClick={handleOpenCreate}>
                    <Plus className="h-4 w-4 mr-2" /> Criar Vaga
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {jobs.map(job => (
                  <Card key={job.id} className="transition-all hover:shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-lg">{job.title}</CardTitle>
                            <Badge variant={job.is_active ? 'default' : 'secondary'}>
                              {job.is_active ? 'Ativa' : 'Inativa'}
                            </Badge>
                            <Badge variant="outline">{job.job_type === 'CLT' ? 'CLT' : 'Temporário'}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {job.location && (
                              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                            )}
                            {job.salary_range && (
                              <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{job.salary_range}</span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(job.created_at).toLocaleDateString('pt-BR')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {(applications[job.id] || []).length} candidato(s)
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedJobId(selectedJobId === job.id ? null : job.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" /> Candidatos
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleOpenEdit(job)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleToggleActive(job)}>
                            {job.is_active ? 'Desativar' : 'Ativar'}
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(job.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {selectedJobId === job.id && (
                      <CardContent className="pt-0">
                        <Separator className="mb-4" />
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Users className="h-4 w-4" /> Candidatos ({(applications[job.id] || []).length})
                        </h4>
                        {(applications[job.id] || []).length === 0 ? (
                          <p className="text-sm text-muted-foreground">Nenhum candidato ainda.</p>
                        ) : (
                          <div className="space-y-3">
                            {(applications[job.id] || []).map(app => (
                              <Card key={app.id} className="bg-muted/50">
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                      <p className="font-medium text-foreground">{app.candidate_name}</p>
                                      <p className="text-sm text-muted-foreground">{app.candidate_email}</p>
                                      {app.candidate_phone && (
                                        <p className="text-sm text-muted-foreground">📞 {app.candidate_phone}</p>
                                      )}
                                      {app.message && (
                                        <p className="text-sm text-muted-foreground mt-2 italic">"{app.message}"</p>
                                      )}
                                      <p className="text-xs text-muted-foreground">
                                        Candidatura em {new Date(app.created_at).toLocaleDateString('pt-BR')}
                                      </p>
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      asChild
                                    >
                                      <a
                                        href={getResumeUrl(app.resume_url)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1"
                                      >
                                        <Download className="h-4 w-4" /> Currículo
                                      </a>
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="candidates">
            <Card>
              <CardHeader>
                <CardTitle>Todos os Candidatos</CardTitle>
                <CardDescription>Visualize todos os candidatos de todas as suas vagas</CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(applications).length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Nenhum candidato ainda.</p>
                ) : (
                  <div className="space-y-6">
                    {jobs.filter(j => (applications[j.id] || []).length > 0).map(job => (
                      <div key={job.id}>
                        <h4 className="font-semibold text-foreground mb-3">{job.title}</h4>
                        <div className="space-y-3 ml-4">
                          {(applications[job.id] || []).map(app => (
                            <div key={app.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                              <div>
                                <p className="font-medium">{app.candidate_name}</p>
                                <p className="text-sm text-muted-foreground">{app.candidate_email}</p>
                                {app.candidate_phone && (
                                  <p className="text-sm text-muted-foreground">{app.candidate_phone}</p>
                                )}
                              </div>
                              <Button variant="outline" size="sm" asChild>
                                <a href={getResumeUrl(app.resume_url)} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-4 w-4 mr-1" /> PDF
                                </a>
                              </Button>
                            </div>
                          ))}
                        </div>
                        <Separator className="mt-4" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create/Edit Job Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingJob ? 'Editar Vaga' : 'Nova Vaga de Emprego'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label>Título da Vaga *</Label>
                <Input
                  value={formData.title}
                  onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                  placeholder="Ex: Desenvolvedor Full Stack"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  placeholder="Descreva a vaga em detalhes..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Vaga</Label>
                  <Select value={formData.job_type} onValueChange={v => setFormData(p => ({ ...p, job_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CLT">CLT</SelectItem>
                      <SelectItem value="temporario">Temporário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Localização</Label>
                  <Input
                    value={formData.location}
                    onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                    placeholder="São Paulo, SP"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Faixa Salarial</Label>
                <Input
                  value={formData.salary_range}
                  onChange={e => setFormData(p => ({ ...p, salary_range: e.target.value }))}
                  placeholder="R$ 3.000 - R$ 5.000"
                />
              </div>
              <div className="space-y-2">
                <Label>Requisitos</Label>
                <Textarea
                  value={formData.requirements}
                  onChange={e => setFormData(p => ({ ...p, requirements: e.target.value }))}
                  placeholder="Liste os requisitos da vaga..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Benefícios</Label>
                <Textarea
                  value={formData.benefits}
                  onChange={e => setFormData(p => ({ ...p, benefits: e.target.value }))}
                  placeholder="VR, VT, Plano de Saúde..."
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={saving}>
                  {saving ? 'Salvando...' : editingJob ? 'Salvar Alterações' : 'Criar Vaga'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default EmpresaJobManagement;
