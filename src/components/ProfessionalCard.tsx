
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, MessageCircle, Calendar, Star, MapPin, Clock, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Professional } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';
import ProfessionalAvatar from '@/components/professional/ProfessionalAvatar';
import ProfessionalPortfolio from '@/components/professional/ProfessionalPortfolio';
import { useRealTimeChat } from '@/hooks/useRealTimeChat';
import { useToast } from '@/components/ui/use-toast';

interface ProfessionalCardProps {
  professional: Professional;
  index?: number;
}

const ProfessionalCard: React.FC<ProfessionalCardProps> = ({ professional, index = 0 }) => {
  const navigate = useNavigate();
  const { createConversation } = useRealTimeChat();
  const { toast } = useToast();
  
  const isVerified = professional.isVerified || false;
  const responseTime = professional.responseTime || "1h";
  const responseRate = professional.responseRate || 95;
  const freelancerId = professional.id.split('/')[0];

  const handleViewProfile = () => navigate(`/freelancer/${freelancerId}`);

  const handleContact = async () => {
    try {
      const conversation = await createConversation(freelancerId);
      if (conversation) {
        navigate('/chat', { state: { conversationId: conversation.id, freelancerId, freelancerName: professional.name } });
        toast({ title: "Conversa iniciada", description: `Conversa iniciada com ${professional.name}` });
      }
    } catch {
      toast({ title: "Erro", description: "Erro ao iniciar conversa. Tente novamente.", variant: "destructive" });
    }
  };

  const handleHire = () => {
    navigate('/chat', { state: { freelancerId, offerType: 'hire', serviceTitle: professional.description } });
  };

  const categoryNames = professional.categories?.join(', ') || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
    >
      <div className="flex items-start gap-4">
        <ProfessionalAvatar
          avatar={professional.avatar}
          name={professional.name}
          available={professional.available}
          isVerified={isVerified}
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{professional.name}</h3>
              {isVerified && <BadgeCheck className="h-5 w-5 text-primary flex-shrink-0" />}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {professional.ratingCount > 0 ? (
                <>
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-bold">{professional.rating.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">({professional.ratingCount})</span>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">Novo</span>
              )}
            </div>
          </div>
          
          <p className="text-sm text-primary font-medium mb-2">{categoryNames}</p>
          
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{professional.distance}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {professional.available ? 'Disponível' : 'Indisponível'}
            </span>
            <span>Responde em {responseTime}</span>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{professional.description}</p>
          
          {/* Response stats */}
          <div className="bg-muted/50 rounded-xl p-3 mb-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground">Taxa de resposta</span>
                <span className="ml-2 font-bold text-green-600">{responseRate}%</span>
              </div>
              <div>
                <span className="text-muted-foreground">Tempo médio</span>
                <span className="ml-2 font-bold text-foreground">{responseTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Trust badges */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-lg text-xs text-green-700">
          <Shield className="h-3.5 w-3.5" />
          <span>HELPAQUI Garantia: Cobertura em até 7 dias</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg text-xs text-primary">
          <Shield className="h-3.5 w-3.5" />
          <span>Contato seguro</span>
        </div>
      </div>
      
      {/* Price & Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <div className="flex items-center gap-3">
          <span className="font-bold text-xl text-secondary">{professional.price}</span>
          {professional.available && (
            <span className="bg-green-500/10 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium">
              Disponível
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleViewProfile} className="rounded-xl text-xs h-9 border-border/80 hover:border-primary/50 hover:text-primary">
            Ver perfil
          </Button>
          <Button variant="outline" size="sm" onClick={handleContact} className="rounded-xl text-xs h-9 border-border/80 hover:border-primary/50 hover:text-primary">
            <MessageCircle className="h-3.5 w-3.5 mr-1" />
            Conversar
          </Button>
          <Button size="sm" onClick={handleHire} className="rounded-xl text-xs h-9 gradient-primary text-white border-0 shadow-md shadow-primary/20 hover:shadow-lg">
            <Calendar className="h-3.5 w-3.5 mr-1" />
            Contratar
          </Button>
        </div>
      </div>
      
      <ProfessionalPortfolio portfolio={professional.portfolio || []} />
    </motion.div>
  );
};

export default ProfessionalCard;
