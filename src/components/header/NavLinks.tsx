
import React from 'react';
import { Link } from 'react-router-dom';
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface NavLinksProps {
  currentPath: string;
}

const NavLinks: React.FC<NavLinksProps> = ({ currentPath }) => {
  const { userType } = useAuth();

  return (
    <nav className="hidden md:flex gap-6">
      <Link
        to="/"
        className={cn(
          navigationMenuTriggerStyle(),
          "bg-transparent",
          currentPath === "/" && "text-helpaqui-blue font-medium"
        )}
      >
        Início
      </Link>
      <Link
        to="/jobs"
        className={cn(
          navigationMenuTriggerStyle(),
          "bg-transparent",
          currentPath === "/jobs" && "text-helpaqui-blue font-medium"
        )}
      >
        Serviços
      </Link>
      {userType === 'solicitante' && (
        <Link
          to="/solicitante-plans"
          className={cn(
            navigationMenuTriggerStyle(),
            "bg-transparent",
            currentPath === "/solicitante-plans" && "text-helpaqui-blue font-medium"
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
            "bg-transparent",
            currentPath === "/freelancer-plans" && "text-helpaqui-blue font-medium"
          )}
        >
          Planos
        </Link>
      )}
      <Link
        to="/chat"
        className={cn(
          navigationMenuTriggerStyle(),
          "bg-transparent",
          currentPath === "/chat" && "text-helpaqui-blue font-medium"
        )}
      >
        Bate Papo
      </Link>
      <Link
        to="/ai-chat"
        className={cn(
          navigationMenuTriggerStyle(),
          "bg-transparent",
          currentPath === "/ai-chat" && "text-helpaqui-blue font-medium"
        )}
      >
        AI Chat
      </Link>
      <Link
        to="/notes"
        className={cn(
          navigationMenuTriggerStyle(),
          "bg-transparent",
          currentPath === "/notes" && "text-helpaqui-blue font-medium"
        )}
      >
        Notas
      </Link>
      <Link
        to="/payments"
        className={cn(
          navigationMenuTriggerStyle(),
          "bg-transparent",
          currentPath === "/payments" && "text-helpaqui-blue font-medium"
        )}
      >
        Pagamentos
      </Link>
      <Link
        to="/profile"
        className={cn(
          navigationMenuTriggerStyle(),
          "bg-transparent",
          currentPath === "/profile" && "text-helpaqui-blue font-medium"
        )}
      >
        Perfil
      </Link>
    </nav>
  );
};

export default NavLinks;
