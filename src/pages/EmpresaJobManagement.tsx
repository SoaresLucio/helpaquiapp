
import React, { useState } from 'react';
import Header from '@/components/Header';
import BackButton from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Plus, Users, FileText, Building, Download } from 'lucide-react';
import { useEmpresaJobs } from '@/hooks/useEmpresaJobs';
import JobFormDialog, { emptyJobForm, type JobFormData } from '@/components/empresa/jobs/JobFormDialog';
import JobCard from '@/components/empresa/jobs/JobCard';
import { supabase } from '@/integrations/supabase/client';

const EmpresaJobManagement = () => {
  const { jobs, applications, loading, companyInfo, saveJob, deleteJob, toggleActive } = useEmpresaJobs();
  const [showForm, setShowForm] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [formData, setFormData] = useState<JobFormData>(emptyJobForm);
  const [saving, setSaving] = useState(false);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingJobId(null);
    setFormData(emptyJobForm);
    setShowForm(true);
  };

  const handleOpenEdit = (job: any) => {
    setEditingJobId(job.id);
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
    if (!formData.title.trim()) return;
    setSaving(true);
    const success = await saveJob(formData, editingJobId || undefined);
    if (success) setShowForm(false);
    setSaving(false);
  };

  const getResumeUrl = (path: string) => {
    const { data } = supabase.storage.from('resumes').getPublicUrl(path);
    return data.publicUrl;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-6">
          <BackButton to="/dashboard" label="Voltar ao Início" />
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Building className="h-7 w-7 text-primary" />
              Gerenciar Vagas de Emprego
            </h1>
            {companyInfo && <p className="text-muted-foreground text-sm mt-1">{companyInfo.company_name}</p>}
          </div>
          <Button onClick={handleOpenCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Nova Vaga
          </Button>
        </div>

        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList>
            <TabsTrigger value="jobs">Minhas Vagas ({jobs.length})</TabsTrigger>
            <TabsTrigger value="candidates">Todos os Candidatos</TabsTrigger>
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
                  <p className="text-muted-foreground mb-4">Crie sua primeira vaga para começar a receber candidatos.</p>
                  <Button onClick={handleOpenCreate}><Plus className="h-4 w-4 mr-2" /> Criar Vaga</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {jobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    applications={applications[job.id] || []}
                    isExpanded={expandedJobId === job.id}
                    onToggleExpand={() => setExpandedJobId(expandedJobId === job.id ? null : job.id)}
                    onEdit={() => handleOpenEdit(job)}
                    onDelete={() => deleteJob(job.id)}
                    onToggleActive={() => toggleActive(job)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="candidates">
            <Card>
              <CardHeader>
                <CardTitle>Todos os Candidatos</CardTitle>
                <CardDescription>Candidatos de todas as suas vagas</CardDescription>
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
                                {app.candidate_phone && <p className="text-sm text-muted-foreground">{app.candidate_phone}</p>}
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

        <JobFormDialog
          open={showForm}
          onOpenChange={setShowForm}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSave}
          saving={saving}
          isEditing={!!editingJobId}
        />
      </div>
    </div>
  );
};

export default EmpresaJobManagement;
