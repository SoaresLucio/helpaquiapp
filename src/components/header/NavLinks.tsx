
import React from 'react';
import { Link } from 'react-router-dom';
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { cn } from '@/lib/utils';

interface NavLinksProps {
  currentPath: string;
}

const NavLinks: React.FC<NavLinksProps> = ({ currentPath }) => {
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
    </nav>
  );
};

export default NavLinks;
