
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Star } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  client: string;
  date: string;
  status: string;
  rating: number | null;
  amount: string;
}

interface FreelancerRecentJobsCardProps {
  recentJobs: Job[];
}

const FreelancerRecentJobsCard: React.FC<FreelancerRecentJobsCardProps> = ({ recentJobs }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Trabalhos Recentes
        </CardTitle>
        <CardDescription>
          Histórico dos seus últimos trabalhos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentJobs.map(job => (
            <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium">{job.title}</h4>
                <p className="text-sm text-gray-500">Cliente: {job.client}</p>
                <p className="text-xs text-gray-400">{job.date}</p>
              </div>
              
              <div className="text-right">
                <p className="font-medium text-green-600">{job.amount}</p>
                {job.rating && (
                  <div className="flex items-center">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs ml-1">{job.rating}</span>
                  </div>
                )}
                <Badge 
                  variant={job.status === 'completed' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {job.status === 'completed' ? 'Concluído' : 'Pendente'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        
        <Button variant="outline" className="w-full mt-4">
          Ver Todos os Trabalhos
        </Button>
      </CardContent>
    </Card>
  );
};

export default FreelancerRecentJobsCard;
