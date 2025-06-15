
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { MessageSquare } from 'lucide-react';

interface ShowInterestDialogProps {
  offerId: string;
  freelancerName: string;
  children?: React.ReactNode;
}

const ShowInterestDialog: React.FC<ShowInterestDialogProps> = ({
  offerId,
  freelancerName,
  children
}) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para demonstrar interesse.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('offer_interests')
        .insert({
          offer_id: offerId,
          solicitante_id: user.id,
          message: message.trim() || null
        });

      if (error) {
        console.error('Erro ao demonstrar interesse:', error);
        toast({
          title: "Erro",
          description: "Não foi possível demonstrar interesse. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Interesse demonstrado!",
        description: `Seu interesse foi enviado para ${freelancerName}.`
      });

      setOpen(false);
      setMessage('');
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            Demonstrar Interesse
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Demonstrar Interesse</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Envie uma mensagem para <strong>{freelancerName}</strong> demonstrando seu interesse neste serviço.
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="message">Mensagem (opcional)</Label>
            <Textarea
              id="message"
              placeholder="Olá! Tenho interesse no seu serviço..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Interesse'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShowInterestDialog;
