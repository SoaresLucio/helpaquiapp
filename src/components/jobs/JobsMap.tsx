
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

interface JobListing {
  id: string;
  title: string;
  company_name: string;
  location: string;
}

interface JobsMapProps {
  jobs: JobListing[];
}

const JobsMap: React.FC<JobsMapProps> = ({ jobs }) => {
  // Para uma implementação futura com Google Maps ou similar
  const jobsWithLocation = jobs.filter(job => job.location);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Mapa de Vagas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <MapPin className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-gray-600">
              Mapa de vagas será implementado em breve
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {jobsWithLocation.length} vagas com localização
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobsMap;
