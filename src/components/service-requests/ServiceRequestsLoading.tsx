
import React from 'react';

const ServiceRequestsLoading: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-helpaqui-blue"></div>
      </div>
    </div>
  );
};

export default ServiceRequestsLoading;
