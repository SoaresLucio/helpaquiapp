
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Clock, DollarSign, Calendar } from 'lucide-react';
import { ServiceRequest, createServiceProposal } from '@/services/jobsService';
import { useToast } from '@/components/ui/use-toast';

interface JobCardProps {
  job: ServiceRequest;
  onProposalSubmitted?: () => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onProposalSubmitted }) => {
  const [isProposalOpen, setIsProposalOpen] = useState(false);
  const [proposalData, setProposalData] = useState({
    message: '',
    proposedPrice: '',
    estimatedTime: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmitProposal = async () => {
    if (!proposalData.message || !proposalData.proposedPrice) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha a mensagem e o preço proposto",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createServiceProposal(
        job.id,
        proposalData.message,
        parseInt(proposalData.proposedPrice),
        proposalData.estimatedTime
      );

      toast({
        title: "Proposta enviada",
        description: "Sua proposta foi enviada com sucesso!"
      });

      setIsProposalOpen(false);
      setProposalData({ message: '', proposedPrice: '', estimatedTime: '' });
      
      if (onProposalSubmitted) {
        onProposalSubmitted();
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatBudget = (min?: number | null, max?: number | null) => {
    if (!min && !max) return 'Orçamento não informado';
    if (min && max) return `R$ ${min} - R$ ${max}`;
    if (min) return `A partir de R$ ${min}`;
    if (max) return `Até R$ ${max}`;
    return 'Orçamento não informado';
  };

  const getUrgencyColor = (urgency?: string | null) => {
    switch (urgency) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'normal': return 'secondary';
      default: return 'secondary';
    }
  };

  const getUrgencyText = (urgency?: string | null) => {
    switch (urgency) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'normal': return 'Normal';
      default: return 'Normal';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{job.title}</CardTitle>
            <CardDescription className="mt-1">
              <Badge variant="outline" className="mr-2">{job.category}</Badge>
              <Badge variant={getUrgencyColor(job.urgency)}>
                {getUrgencyText(job.urgency)}
              </Badge>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">{job.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {job.location_address && (
            <div className="flex items-center text-gray-600">
              <MapPin className="h-4 w-4 mr-2 text-helpaqui-blue" />
              <span>{job.location_address}</span>
            </div>
          )}
          
          <div className="flex items-center text-gray-600">
            <DollarSign className="h-4 w-4 mr-2 text-green-600" />
            <span>{formatBudget(job.budget_min, job.budget_max)}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-helpaqui-blue" />
            <span>{new Date(job.created_at).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>

        <Dialog open={isProposalOpen} onOpenChange={setIsProposalOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-helpaqui-green hover:bg-helpaqui-green/90">
              Enviar Proposta
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Enviar Proposta</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="message">Mensagem *</Label>
                <Textarea
                  id="message"
                  placeholder="Descreva sua experiência e como pretende realizar o trabalho..."
                  value={proposalData.message}
                  onChange={(e) => setProposalData(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="price">Preço Proposto (R$) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="Ex: 150"
                  value={proposalData.proposedPrice}
                  onChange={(e) => setProposalData(prev => ({ ...prev, proposedPrice: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="time">Tempo Estimado</Label>
                <Input
                  id="time"
                  placeholder="Ex: 2 horas, 1 dia"
                  value={proposalData.estimatedTime}
                  onChange={(e) => setProposalData(prev => ({ ...prev, estimatedTime: e.target.value }))}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsProposalOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSubmitProposal}
                  disabled={isSubmitting}
                  className="bg-helpaqui-green hover:bg-helpaqui-green/90"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Proposta'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default JobCard;
