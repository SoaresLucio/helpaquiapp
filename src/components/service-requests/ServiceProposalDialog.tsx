
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { createServiceProposal } from '@/services/jobsService';
import { DollarSign, Clock, Send } from 'lucide-react';

interface ServiceProposalDialogProps {
  serviceRequestId: string;
  serviceTitle: string;
  children: React.ReactNode;
}

const ServiceProposalDialog: React.FC<ServiceProposalDialogProps> = ({
  serviceRequestId,
  serviceTitle,
  children
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    message: '',
    proposedPrice: '',
    estimatedTime: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.message.trim() || !formData.proposedPrice || !formData.estimatedTime) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para enviar sua proposta.",
        variant: "destructive"
      });
      return;
    }

    const price = parseFloat(formData.proposedPrice);
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Preço inválido",
        description: "Digite um preço válido para sua proposta.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      await createServiceProposal(
        serviceRequestId,
        formData.message.trim(),
        Math.round(price * 100), // Convert to cents
        formData.estimatedTime
      );

      toast({
        title: "Proposta enviada!",
        description: "Sua proposta foi enviada com sucesso. O cliente receberá uma notificação."
      });

      setFormData({
        message: '',
        proposedPrice: '',
        estimatedTime: ''
      });
      setOpen(false);
    } catch (error: any) {
      console.error('Error creating proposal:', error);
      toast({
        title: "Erro ao enviar proposta",
        description: error.message || "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    const formattedValue = (parseFloat(numericValue) / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return formattedValue;
  };

  const handlePriceChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue) {
      const formattedValue = formatCurrency(numericValue);
      setFormData(prev => ({ ...prev, proposedPrice: formattedValue }));
    } else {
      setFormData(prev => ({ ...prev, proposedPrice: '' }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Enviar Proposta</DialogTitle>
          <DialogDescription>
            Envie sua proposta para: <strong>{serviceTitle}</strong>
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="message">Mensagem *</Label>
            <Textarea
              id="message"
              placeholder="Descreva como você pode ajudar o cliente e por que é a melhor escolha para este trabalho..."
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="proposedPrice">Preço Proposto *</Label>
              <div className="relative">
                <Input
                  id="proposedPrice"
                  placeholder="0,00"
                  value={formData.proposedPrice}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  className="pl-10"
                  required
                />
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div>
              <Label htmlFor="estimatedTime">Prazo Estimado *</Label>
              <div className="relative">
                <Input
                  id="estimatedTime"
                  placeholder="Ex: 2 dias, 1 semana"
                  value={formData.estimatedTime}
                  onChange={(e) => handleInputChange('estimatedTime', e.target.value)}
                  className="pl-10"
                  required
                />
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Proposta
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceProposalDialog;
