
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Pencil, Trash2, Users, MapPin, Clock, DollarSign, Eye, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface JobApplication {
  id: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string | null;
  message: string | null;
  resume_url: string;
  created_at: string;
}

interface JobCardProps {
  job: {
    id: string;
    title: string;
    is_active: boolean;
    job_type: string;
    location: string | null;
    salary_range: string | null;
    created_at: string;
  };
  applications: JobApplication[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}

const JobCard: React.FC<JobCardProps> = ({
  job, applications, isExpanded, onToggleExpand, onEdit, onDelete, onToggleActive
}) => {
  const getResumeUrl = (path: string) => {
    const { data } = supabase.storage.from('resumes').getPublicUrl(path);
    return data.publicUrl;
  };

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <CardTitle className="text-lg">{job.title}</CardTitle>
              <Badge variant={job.is_active ? 'default' : 'secondary'}>
                {job.is_active ? 'Ativa' : 'Inativa'}
              </Badge>
              <Badge variant="outline">{job.job_type === 'CLT' ? 'CLT' : 'Temporário'}</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              {job.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>}
              {job.salary_range && <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{job.salary_range}</span>}
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(job.created_at).toLocaleDateString('pt-BR')}</span>
              <span className="flex items-center gap-1"><Users className="h-3 w-3" />{applications.length} candidato(s)</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={onToggleExpand}>
              <Eye className="h-4 w-4 mr-1" /> Candidatos
            </Button>
            <Button variant="outline" size="sm" onClick={onEdit}><Pencil className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={onToggleActive}>{job.is_active ? 'Desativar' : 'Ativar'}</Button>
            <Button variant="destructive" size="sm" onClick={onDelete}><Trash2 className="h-4 w-4" /></Button>
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="pt-0">
          <Separator className="mb-4" />
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" /> Candidatos ({applications.length})
          </h4>
          {applications.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum candidato ainda.</p>
          ) : (
            <div className="space-y-3">
              {applications.map(app => (
                <Card key={app.id} className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">{app.candidate_name}</p>
                        <p className="text-sm text-muted-foreground">{app.candidate_email}</p>
                        {app.candidate_phone && <p className="text-sm text-muted-foreground">📞 {app.candidate_phone}</p>}
                        {app.message && <p className="text-sm text-muted-foreground mt-2 italic">"{app.message}"</p>}
                        <p className="text-xs text-muted-foreground">Candidatura em {new Date(app.created_at).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={getResumeUrl(app.resume_url)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
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
  );
};

export default JobCard;
