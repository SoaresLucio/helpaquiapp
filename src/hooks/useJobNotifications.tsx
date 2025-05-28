
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface JobNotification {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  budget: string;
  date: string;
  clientName: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: number;
}

export const useJobNotifications = () => {
  const [notifications, setNotifications] = useState<JobNotification[]>([]);
  const [currentNotification, setCurrentNotification] = useState<JobNotification | null>(null);
  const { userType } = useAuth();

  useEffect(() => {
    // Only freelancers should receive job notifications
    if (userType !== 'freelancer') return;

    // Simulate receiving job notifications
    const simulateNotifications = () => {
      const mockJobs: JobNotification[] = [
        {
          id: '1',
          title: 'Reparo Elétrico Urgente',
          description: 'Preciso de um eletricista para consertar tomadas queimadas',
          category: 'Elétrica',
          location: 'Vila Madalena, São Paulo',
          budget: 'R$ 150-200',
          date: 'Hoje à tarde',
          clientName: 'João Silva',
          urgency: 'urgent',
          timestamp: Date.now()
        },
        {
          id: '2',
          title: 'Limpeza Residencial',
          description: 'Limpeza completa de casa para mudança',
          category: 'Limpeza',
          location: 'Pinheiros, São Paulo',
          budget: 'R$ 200-300',
          date: 'Amanhã de manhã',
          clientName: 'Maria Santos',
          urgency: 'medium',
          timestamp: Date.now() + 60000
        }
      ];

      let index = 0;
      const showNotification = () => {
        if (index < mockJobs.length) {
          const job = mockJobs[index];
          setCurrentNotification(job);
          setNotifications(prev => [...prev, job]);
          index++;
          
          // Schedule next notification in 30 seconds
          setTimeout(showNotification, 30000);
        }
      };

      // Show first notification after 5 seconds
      setTimeout(showNotification, 5000);
    };

    simulateNotifications();

    // Listen for real-time job notifications from backend
    const eventSource = new EventSource('/api/job-notifications');
    
    eventSource.onmessage = (event) => {
      const jobData = JSON.parse(event.data);
      const notification: JobNotification = {
        ...jobData,
        timestamp: Date.now()
      };
      
      setCurrentNotification(notification);
      setNotifications(prev => [...prev, notification]);
    };

    return () => {
      eventSource.close();
    };
  }, [userType]);

  const acceptJob = async (jobId: string) => {
    try {
      const response = await fetch('/api/jobs/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId })
      });

      if (!response.ok) {
        throw new Error('Failed to accept job');
      }

      // Remove notification after accepting
      setNotifications(prev => prev.filter(n => n.id !== jobId));
      setCurrentNotification(null);
    } catch (error) {
      console.error('Error accepting job:', error);
      throw error;
    }
  };

  const rejectJob = async (jobId: string) => {
    try {
      const response = await fetch('/api/jobs/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId })
      });

      if (!response.ok) {
        throw new Error('Failed to reject job');
      }

      // Remove notification after rejecting
      setNotifications(prev => prev.filter(n => n.id !== jobId));
      setCurrentNotification(null);
    } catch (error) {
      console.error('Error rejecting job:', error);
      throw error;
    }
  };

  const dismissNotification = () => {
    setCurrentNotification(null);
  };

  return {
    notifications,
    currentNotification,
    acceptJob,
    rejectJob,
    dismissNotification
  };
};
