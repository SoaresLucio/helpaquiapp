
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User as UserIcon } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';

interface UserSectionProps {
  isAuthenticated: boolean;
}

const UserSection: React.FC<UserSectionProps> = ({ isAuthenticated }) => {
  const { user, logout } = useAuth();
  
  // Helper function to get user's initials for avatar fallback
  const getUserInitials = (): string => {
    if (!user) return "U";
    
    const email = user.email || "";
    // If email exists, use first letter
    if (email) return email.charAt(0).toUpperCase();
    
    // Fallback
    return "U";
  };
  
  // Helper function to get display name
  const getDisplayName = (): string => {
    if (!user) return "Usuário";
    
    // Use email without domain as a username if available
    if (user.email) {
      const parts = user.email.split('@');
      return parts[0] || "Usuário";
    }
    
    return "Usuário";
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-4">
        <Link to="/login">
          <Button variant="ghost">Login</Button>
        </Link>
        <Link to="/register">
          <Button>Cadastrar</Button>
        </Link>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt={getDisplayName()} />
            <AvatarFallback>{getUserInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{getDisplayName()}</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email || ""}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to="/profile">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserSection;
