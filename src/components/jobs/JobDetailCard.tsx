
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Building, Clock, DollarSign, FileText } from 'lucide-react';

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

interface JobDetailCardProps {
  job: JobListing;
  onApplyClick: (job: JobListing) => void;
  canApply: boolean;
}

const JobDetailCard: React.FC<JobDetailCardProps> = ({ job, onApplyClick, canApply }) => {
  const getJobTypeLabel = (type: string) => {
    return type === 'CLT' ? 'CLT' : 'Temporário';
  };

  const getJobTypeBadgeVariant = (type: string) => {
    return type === 'CLT' ? 'default' : 'secondary';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
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
            onClick={() => onApplyClick(job)}
            disabled={!canApply}
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
  );
};

export default JobDetailCard;
