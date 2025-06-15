
import React from 'react';
import PushNotification from '@/components/notifications/PushNotification';

interface IndexNotificationsProps {
  currentNotification: any;
  acceptJob: (jobId: string) => void;
  rejectJob: (jobId: string) => void;
  dismissNotification: () => void;
}

const IndexNotifications: React.FC<IndexNotificationsProps> = ({
  currentNotification,
  acceptJob,
  rejectJob,
  dismissNotification
}) => {
  if (!currentNotification) {
    return null;
  }

  return (
    <PushNotification 
      job={currentNotification} 
      onAccept={acceptJob} 
      onReject={rejectJob} 
      onClose={dismissNotification} 
    />
  );
};

export default IndexNotifications;
