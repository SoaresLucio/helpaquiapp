
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, MapPin, Users, DollarSign, Clock } from 'lucide-react';
import { useOfferInterests } from '@/hooks/useOfferInterests';

interface OfferCardProps {
  offer: any;
  onDelete: (offerId: string) => Promise<void>;
  index?: number;
}

const OfferCard: React.FC<OfferCardProps> = ({ offer, onDelete, index = 0 }) => {
  const { interests, loading } = useOfferInterests(offer.id);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir esta oferta?')) {
      setIsDeleting(true);
      try {
        await onDelete(offer.id);
      } catch (error) {
        console.error('Erro ao excluir oferta:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="group border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 rounded-2xl overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors truncate">
                {offer.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                {offer.description}
              </p>
            </div>
            
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary">
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {offer.categories?.map((category: string, i: number) => (
              <Badge key={i} className="bg-primary/10 text-primary border-0 font-medium text-xs rounded-lg px-2.5 py-0.5">
                {category}
              </Badge>
            ))}
            {offer.custom_categories?.map((category: string, i: number) => (
              <Badge key={`custom-${i}`} variant="outline" className="border-border/80 text-muted-foreground text-xs rounded-lg px-2.5 py-0.5">
                {category}
              </Badge>
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex flex-wrap items-center gap-4 py-3 px-4 bg-muted/50 rounded-xl">
            <div className="flex items-center gap-1.5 text-sm">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="font-semibold text-foreground">{offer.rate}</span>
            </div>
            
            {offer.location && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span>{offer.location}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1.5 text-sm ml-auto">
              <Users className="h-4 w-4 text-secondary" />
              <span className="font-semibold text-secondary">
                {loading ? '...' : `${interests.length} interessado(s)`}
              </span>
            </div>
          </div>
          
          {interests.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-primary" />
                Solicitantes Interessados
              </h4>
              <div className="space-y-2">
                {interests.slice(0, 3).map((interest: any) => (
                  <div key={interest.id} className="flex items-start gap-2 text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div>
                      <span className="text-muted-foreground">
                        Interesse em {new Date(interest.created_at).toLocaleDateString('pt-BR')}
                      </span>
                      {interest.message && (
                        <p className="text-xs text-muted-foreground/70 mt-0.5 italic">
                          "{interest.message}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {interests.length > 3 && (
                  <p className="text-xs text-primary font-medium pl-4">
                    +{interests.length - 3} interessado(s) a mais
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default OfferCard;
