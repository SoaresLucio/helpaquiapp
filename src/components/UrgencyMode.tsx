
import React, { useState } from 'react';
import { Bolt, Info, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

interface UrgencyModeProps {
  price: string;
  onEnableUrgency: (enabled: boolean) => void;
}

const UrgencyMode: React.FC<UrgencyModeProps> = ({ price, onEnableUrgency }) => {
  const [isUrgent, setIsUrgent] = useState(false);
  const basePrice = parseFloat(price.replace(/[^0-9,.]/g, '').replace(',', '.'));
  const urgentPrice = (basePrice * 1.5).toFixed(2).replace('.', ',');

  const handleToggle = (checked: boolean) => {
    setIsUrgent(checked);
    onEnableUrgency(checked);
  };

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bolt className="h-5 w-5 text-amber-500" />
            Modo Urgência
          </CardTitle>
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
            +50% Valor
          </Badge>
        </div>
        <CardDescription>
          Precisa para hoje? Ative o modo urgência e obtenha prioridade.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center">
              <span className="text-sm font-medium">Prazo normal</span>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-auto p-0 ml-1">
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80 p-2">
                  <p className="text-xs">
                    O profissional responderá de acordo com sua disponibilidade normal.
                  </p>
                </HoverCardContent>
              </HoverCard>
            </div>
            <span className="text-lg font-medium">{price}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch id="urgency-mode" checked={isUrgent} onCheckedChange={handleToggle} />
            <Label htmlFor="urgency-mode">Ativar</Label>
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center">
              <span className="text-sm font-medium">Modo urgência</span>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-auto p-0 ml-1">
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80 p-2">
                  <p className="text-xs">
                    O profissional será notificado imediatamente e terá prioridade para atender sua solicitação hoje.
                  </p>
                </HoverCardContent>
              </HoverCard>
            </div>
            <span className="text-lg font-medium">R$ {urgentPrice}</span>
          </div>
        </div>
        
        {isUrgent && (
          <div className="mt-4 flex items-start gap-2 p-3 bg-amber-100 rounded-md">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Importante:</p>
              <p>O modo urgência não garante a disponibilidade imediata do profissional, mas aumenta significativamente suas chances de ser atendido hoje.</p>
            </div>
          </div>
        )}
      </CardContent>
      {isUrgent && (
        <CardFooter className="pt-0">
          <p className="text-xs text-gray-500 w-full text-center">
            Ao ativar o modo urgência, você concorda com o pagamento adicional de 50% sobre o valor do serviço.
          </p>
        </CardFooter>
      )}
    </Card>
  );
};

export default UrgencyMode;
