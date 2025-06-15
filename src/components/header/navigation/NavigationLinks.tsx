import React from 'react';
import { Link } from 'react-router-dom';
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { cn } from '@/lib/utils';
interface NavigationLinksProps {
  currentPath: string;
  userType: 'solicitante' | 'freelancer' | null;
}
const NavigationLinks: React.FC<NavigationLinksProps> = ({
  currentPath,
  userType
}) => {
  return <nav className="hidden md:flex gap-6">
      <Link to="/" className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-gray-100 transition-colors", currentPath === "/" && "text-helpaqui-blue font-medium bg-blue-50")}>
        Início
      </Link>
      
      <Link to="/jobs" className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-gray-100 transition-colors", currentPath === "/jobs" && "text-helpaqui-blue font-medium bg-blue-50")}>Ofertas de Help</Link>
      
      {userType === 'solicitante' && <Link to="/solicitante-plans" className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-gray-100 transition-colors", currentPath === "/solicitante-plans" && "text-helpaqui-blue font-medium bg-blue-50")}>
          Planos
        </Link>}
      
      {userType === 'freelancer' && <Link to="/freelancer-plans" className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-gray-100 transition-colors", currentPath === "/freelancer-plans" && "text-helpaqui-blue font-medium bg-blue-50")}>
          Planos
        </Link>}
      
      {userType === 'freelancer' && <Link to="/payment-freelancer-settings" className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-gray-100 transition-colors", currentPath === "/payment-freelancer-settings" && "text-helpaqui-blue font-medium bg-blue-50")}>
          Pagamentos
        </Link>}
      
      <Link to="/chat" className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-gray-100 transition-colors", currentPath === "/chat" && "text-helpaqui-blue font-medium bg-blue-50")}>
        Bate Papo
      </Link>
      
      <Link to="/ai-chat" className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-gray-100 transition-colors", currentPath === "/ai-chat" && "text-helpaqui-blue font-medium bg-blue-50")}>
        AI Chat
      </Link>
    </nav>;
};
export default NavigationLinks;