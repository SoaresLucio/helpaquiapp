
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, DollarSign, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

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
}

interface PushNotificationProps {
  job: JobNotification;
  onAccept: (jobId: string) => void;
  onReject: (jobId: string) => void;
  onClose: () => void;
}

const PushNotification: React.FC<PushNotificationProps> = ({
  job,
  onAccept,
  onReject,
  onClose
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      await onAccept(job.id);
      toast({
        title: "Trabalho aceito!",
        description: "Você aceitou o trabalho. Entre em contato com o cliente.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível aceitar o trabalho. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      await onReject(job.id);
      toast({
        title: "Trabalho recusado",
        description: "Você recusou este trabalho.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível recusar o trabalho. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta Prioridade';
      case 'medium': return 'Média Prioridade';
      default: return 'Baixa Prioridade';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white shadow-2xl animate-in slide-in-from-top-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <CardTitle className="text-lg">Novo Trabalho Disponível!</CardTitle>
            </div>
            <Badge variant={getUrgencyColor(job.urgency)}>
              {getUrgencyText(job.urgency)}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-1">{job.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{job.description}</p>
            <Badge variant="outline" className="mb-3">{job.category}</Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Local:</span>
              <span>{job.location}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="font-medium">Orçamento:</span>
              <span className="text-green-600 font-semibold">{job.budget}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-purple-600" />
              <span className="font-medium">Data:</span>
              <span>{job.date}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="font-medium">Cliente:</span>
              <span>{job.clientName}</span>
            </div>
          </div>

          <div className="pt-4 space-y-2">
            <Button 
              onClick={handleAccept}
              disabled={isProcessing}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {isProcessing ? "Processando..." : "Aceitar Trabalho"}
            </Button>
            
            <Button 
              onClick={handleReject}
              disabled={isProcessing}
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50"
            >
              <XCircle className="mr-2 h-4 w-4" />
              {isProcessing ? "Processando..." : "Recusar"}
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center pt-2">
            Esta notificação expira em 10 minutos
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PushNotification;
