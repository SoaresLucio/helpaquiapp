
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface PlanBadgeProps {
  planName: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const PlanBadge: React.FC<PlanBadgeProps> = ({ 
  planName, 
  size = 'md', 
  showIcon = true 
}) => {
  const getPlanStyles = (plan: string) => {
    switch (plan) {
      case 'Help Bronze':
        return {
          className: 'bg-gradient-to-r from-amber-700 to-amber-800 text-white border-amber-600',
          icon: '🥉',
          textColor: 'text-amber-700'
        };
      case 'Help Prata':
        return {
          className: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white border-gray-400',
          icon: '🥈',
          textColor: 'text-gray-600'
        };
      case 'Help Ouro':
        return {
          className: 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white border-yellow-400',
          icon: '🥇',
          textColor: 'text-yellow-600'
        };
      default:
        return {
          className: 'bg-gray-200 text-gray-700 border-gray-300',
          icon: '🏷️',
          textColor: 'text-gray-600'
        };
    }
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  const styles = getPlanStyles(planName);

  return (
    <Badge 
      className={`${styles.className} ${sizeStyles[size]} font-semibold shadow-sm`}
      variant="outline"
    >
      {showIcon && <span className="mr-1">{styles.icon}</span>}
      {planName}
    </Badge>
  );
};

export default PlanBadge;
