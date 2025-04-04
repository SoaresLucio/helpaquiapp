
import React from 'react';
import { Clock, MessageCircle } from 'lucide-react';

interface ResponseTimeIndicatorProps {
  averageTime: string;
  responseRate?: number;
}

const ResponseTimeIndicator: React.FC<ResponseTimeIndicatorProps> = ({ 
  averageTime, 
  responseRate = 0 
}) => {
  const getTimeColor = () => {
    const timeInMinutes = parseInt(averageTime);
    if (isNaN(timeInMinutes)) return "text-gray-500";
    if (timeInMinutes < 30) return "text-green-600";
    if (timeInMinutes < 60) return "text-yellow-600";
    return "text-orange-600";
  };

  const getRateColor = () => {
    if (responseRate >= 90) return "text-green-600";
    if (responseRate >= 70) return "text-yellow-600";
    return "text-orange-600";
  };

  return (
    <div className="flex items-center gap-6 text-sm">
      <div className="flex items-center gap-1.5">
        <Clock className={`h-4 w-4 ${getTimeColor()}`} />
        <span className="text-gray-600">Responde em</span>
        <span className={`font-medium ${getTimeColor()}`}>{averageTime}</span>
      </div>
      
      {responseRate > 0 && (
        <div className="flex items-center gap-1.5">
          <MessageCircle className={`h-4 w-4 ${getRateColor()}`} />
          <span className="text-gray-600">Taxa de resposta</span>
          <span className={`font-medium ${getRateColor()}`}>{responseRate}%</span>
        </div>
      )}
    </div>
  );
};

export default ResponseTimeIndicator;
