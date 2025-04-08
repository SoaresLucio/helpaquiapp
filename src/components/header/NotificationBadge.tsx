
import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ServiceNotification from '@/components/ServiceNotification';

interface NotificationBadgeProps {
  notifications: number;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ notifications }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notifications > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
              {notifications}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notificações</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {notifications > 0 ? (
            <div className="max-h-96 overflow-auto">
              <ServiceNotification
                title="Nova solicitação de serviço"
                description="João Silva solicitou um serviço de encanador"
                time="Há 5 minutos"
              />
              <ServiceNotification
                title="Orçamento aprovado"
                description="Seu orçamento para o serviço de jardinagem foi aprovado"
                time="Há 30 minutos"
              />
              <ServiceNotification
                title="Avaliação recebida"
                description="Você recebeu uma avaliação 5 estrelas!"
                time="Há 2 horas"
              />
            </div>
          ) : (
            <DropdownMenuItem disabled className="text-center py-4">
              Nenhuma notificação no momento
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-center text-helpaqui-blue cursor-pointer">
          Ver todas
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBadge;
