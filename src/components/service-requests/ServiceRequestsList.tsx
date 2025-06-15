
import React from 'react';
import ServiceRequestCard from './ServiceRequestCard';

interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  location_address: string;
  budget_min: number;
  budget_max: number;
  status: string;
  urgency: string;
  created_at: string;
  client_id: string;
  client_profile?: {
    first_name: string;
    last_name: string;
  };
}

interface ServiceRequestsListProps {
  requests: ServiceRequest[];
}

const ServiceRequestsList: React.FC<ServiceRequestsListProps> = ({ requests }) => {
  return (
    <div className="grid gap-6">
      {requests.map((request) => (
        <ServiceRequestCard key={request.id} request={request} />
      ))}
    </div>
  );
};

export default ServiceRequestsList;
