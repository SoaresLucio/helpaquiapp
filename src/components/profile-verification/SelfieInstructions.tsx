
import React from 'react';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

const SelfieInstructions: React.FC = () => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link" size="sm" className="p-0 text-xs h-auto">
          Como tirar uma selfie com documento?
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-medium">Instruções para selfie com documento</h4>
          <p className="text-sm">
            Tire uma foto segurando seu documento de identidade ao lado do rosto.
            Certifique-se que seu rosto e as informações do documento estejam claramente visíveis.
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default SelfieInstructions;
