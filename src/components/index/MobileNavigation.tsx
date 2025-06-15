
import React from 'react';
import { MapPin, MessageCircle, PhoneCall } from 'lucide-react';

interface MobileNavigationProps {
  userType: 'solicitante' | 'freelancer' | null;
  onNavigate: (section: string) => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ userType, onNavigate }) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex items-center justify-around p-2 z-10">
      <button 
        className="flex flex-col items-center p-2"
        onClick={() => onNavigate('actions')}
      >
        <MapPin className="h-6 w-6 text-helpaqui-blue" />
        <span className="text-xs mt-1">
          {userType === "freelancer" ? "Oferecer" : "Solicitar"}
        </span>
      </button>
      
      <button 
        className="flex flex-col items-center p-2"
        onClick={() => onNavigate('chat')}
      >
        <MessageCircle className="h-6 w-6 text-helpaqui-blue" />
        <span className="text-xs mt-1">Bate Papo</span>
      </button>
      
      <button className="flex flex-col items-center p-2">
        <PhoneCall className="h-6 w-6 text-helpaqui-blue" />
        <span className="text-xs mt-1">Contatos</span>
      </button>
    </div>
  );
};

export default MobileNavigation;
