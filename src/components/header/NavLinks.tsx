
import React from 'react';
import { Link } from 'react-router-dom';
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface NavLinksProps {
  currentPath: string;
}

const NavLinks: React.FC<NavLinksProps> = ({ currentPath }) => {
  const { userType, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="hidden md:flex gap-6">
      <Link
        to="/"
        className={cn(
          navigationMenuTriggerStyle(),
          "bg-transparent hover:bg-gray-100 transition-colors",
          currentPath === "/" && "text-helpaqui-blue font-medium bg-blue-50"
        )}
      >
        Início
      </Link>
      
      <Link
        to="/jobs"
        className={cn(
          navigationMenuTriggerStyle(),
          "bg-transparent hover:bg-gray-100 transition-colors",
          currentPath === "/jobs" && "text-helpaqui-blue font-medium bg-blue-50"
        )}
      >
        Serviços
      </Link>
      
      {userType === 'solicitante' && (
        <Link
          to="/solicitante-plans"
          className={cn(
            navigationMenuTriggerStyle(),
            "bg-transparent hover:bg-gray-100 transition-colors",
            currentPath === "/solicitante-plans" && "text-helpaqui-blue font-medium bg-blue-50"
          )}
        >
          Planos
        </Link>
      )}
      
      {userType === 'freelancer' && (
        <Link
          to="/freelancer-plans"
          className={cn(
            navigationMenuTriggerStyle(),
            "bg-transparent hover:bg-gray-100 transition-colors",
            currentPath === "/freelancer-plans" && "text-helpaqui-blue font-medium bg-blue-50"
          )}
        >
          Planos
        </Link>
      )}
      
      <Link
        to="/chat"
        className={cn(
          navigationMenuTriggerStyle(),
          "bg-transparent hover:bg-gray-100 transition-colors",
          currentPath === "/chat" && "text-helpaqui-blue font-medium bg-blue-50"
        )}
      >
        Bate Papo
      </Link>
      
      <Link
        to="/ai-chat"
        className={cn(
          navigationMenuTriggerStyle(),
          "bg-transparent hover:bg-gray-100 transition-colors",
          currentPath === "/ai-chat" && "text-helpaqui-blue font-medium bg-blue-50"
        )}
      >
        AI Chat
      </Link>
      
      <Link
        to="/notes"
        className={cn(
          navigationMenuTriggerStyle(),
          "bg-transparent hover:bg-gray-100 transition-colors",
          currentPath === "/notes" && "text-helpaqui-blue font-medium bg-blue-50"
        )}
      >
        Notas
      </Link>
    </nav>
  );
};

export default NavLinks;
