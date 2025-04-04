
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, XCircle, MapPin, DollarSign, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

interface ServiceNotificationProps {
  serviceId: string;
  clientName: string;
  clientAvatar?: string;
  category: string;
  description: string;
  location: string;
  price: number;
  timing: string;
  onAccept: () => void;
  onDecline: () => void;
  onClose: () => void;
}

const ServiceNotification: React.FC<ServiceNotificationProps> = ({
  serviceId,
  clientName,
  clientAvatar,
  category,
  description,
  location,
  price,
  timing,
  onAccept,
  onDecline,
  onClose
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleAccept = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      onAccept();
      toast({
        title: "Serviço aceito!",
        description: "O cliente será notificado do seu interesse.",
      });
      setIsLoading(false);
    }, 1000);
  };
  
  const handleDecline = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      onDecline();
      toast({
        title: "Serviço recusado",
        description: "Você não demonstrou interesse neste serviço.",
      });
      setIsLoading(false);
    }, 1000);
  };
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-16 right-4 left-4 md:left-auto md:w-96 bg-white rounded-lg shadow-lg overflow-hidden z-50"
      >
        <div className="bg-helpaqui-blue text-white p-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Nova oportunidade!</span>
            <Badge variant="secondary" className="bg-white text-helpaqui-blue">
              {category}
            </Badge>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-white hover:bg-blue-700" 
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar>
              <AvatarImage src={clientAvatar} />
              <AvatarFallback>{clientName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium">{clientName}</h4>
              <p className="text-sm text-gray-500">Cliente</p>
            </div>
          </div>
          
          <p className="text-sm mb-4">{description}</p>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2 text-helpaqui-blue" />
              {location}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <DollarSign className="h-4 w-4 mr-2 text-helpaqui-green" />
              {price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2 text-helpaqui-darkGray" />
              {timing}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              className="flex-1 bg-helpaqui-green hover:bg-green-600"
              onClick={handleAccept}
              disabled={isLoading}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Aceitar
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleDecline}
              disabled={isLoading}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Recusar
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ServiceNotification;
