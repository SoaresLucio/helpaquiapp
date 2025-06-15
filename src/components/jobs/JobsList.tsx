
import React from 'react';
import JobDetailCard from './JobDetailCard';

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

interface JobsListProps {
  jobs: JobListing[];
  onApplyClick: (job: JobListing) => void;
  canApply: boolean;
}

const JobsList: React.FC<JobsListProps> = ({ jobs, onApplyClick, canApply }) => {
  return (
    <div className="grid gap-6">
      {jobs.map((job) => (
        <JobDetailCard
          key={job.id}
          job={job}
          onApplyClick={onApplyClick}
          canApply={canApply}
        />
      ))}
    </div>
  );
};

export default JobsList;
