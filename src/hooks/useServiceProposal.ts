
import { useState } from 'react';
import { createServiceProposal } from '@/services/jobsService';
import { useToast } from '@/components/ui/use-toast';

export const useServiceProposal = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const submitProposal = async (
    serviceRequestId: string,
    message: string,
    proposedPrice: number,
    estimatedTime: string
  ) => {
    try {
      setLoading(true);
      
      await createServiceProposal(
        serviceRequestId,
        message,
        proposedPrice,
        estimatedTime
      );

      toast({
        title: "Proposta enviada com sucesso!",
        description: "Sua proposta foi enviada para o cliente.",
      });

      return true;
    } catch (error: any) {
      console.error('Error submitting proposal:', error);
      toast({
        title: "Erro ao enviar proposta",
        description: error.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    submitProposal,
    loading
  };
};
