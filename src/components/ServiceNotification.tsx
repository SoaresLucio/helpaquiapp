
import React from 'react';

export interface ServiceNotificationProps {
  title: string;
  description: string;
  time: string;
}

const ServiceNotification: React.FC<ServiceNotificationProps> = ({ title, description, time }) => {
  return (
    <div className="p-3 hover:bg-gray-100 border-b border-gray-100 last:border-0">
      <div className="flex justify-between items-start">
        <h4 className="font-medium text-sm">{title}</h4>
        <span className="text-xs text-gray-500">{time}</span>
      </div>
      <p className="text-xs text-gray-600 mt-1">{description}</p>
    </div>
  );
};

export default ServiceNotification;
