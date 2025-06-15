
import React, { useState, useEffect } from 'react';
import { useServiceRequests } from '@/hooks/useServiceRequests';
import { useAuth } from '@/hooks/useAuth';
import ServiceRequestsHeader from './ServiceRequestsHeader';
import ServiceRequestsLoading from './ServiceRequestsLoading';
import ServiceRequestsEmpty from './ServiceRequestsEmpty';
import ServiceRequestsList from './ServiceRequestsList';
import ServiceRequestFilters from './ServiceRequestFilters';

const ServiceRequestsContainer: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  const { isAuthenticated, userType } = useAuth();
  
  const { 
    requests, 
    loading, 
    error,
    refetch 
  } = useServiceRequests({
    category: selectedCategory,
    urgency: selectedUrgency,
    enabled: isAuthenticated && userType === 'freelancer'
  });

  // Redirect if not freelancer
  if (!isAuthenticated || userType !== 'freelancer') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Restrito</h1>
          <p className="text-gray-600">Esta página é exclusiva para freelancers.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <ServiceRequestsLoading />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ServiceRequestsHeader />
      
      <ServiceRequestFilters
        selectedCategory={selectedCategory}
        selectedUrgency={selectedUrgency}
        onCategoryChange={setSelectedCategory}
        onUrgencyChange={setSelectedUrgency}
      />

      {requests.length === 0 ? (
        <ServiceRequestsEmpty />
      ) : (
        <ServiceRequestsList requests={requests} />
      )}
    </div>
  );
};

export default ServiceRequestsContainer;
