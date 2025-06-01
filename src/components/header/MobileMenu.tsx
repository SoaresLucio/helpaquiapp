
import React from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

interface MobileMenuProps {
  currentPath: string;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ currentPath }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span className="font-bold text-xl text-helpaqui-blue">HelpAqui</span>
            <SheetClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </SheetTitle>
        </SheetHeader>
        <div className="py-4">
          <nav className="flex flex-col gap-2">
            <SheetClose asChild>
              <Link to="/">
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${currentPath === "/" ? "bg-secondary" : ""}`}
                >
                  Início
                </Button>
              </Link>
            </SheetClose>
            
            <SheetClose asChild>
              <Link to="/jobs">
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${currentPath === "/jobs" ? "bg-secondary" : ""}`}
                >
                  Serviços
                </Button>
              </Link>
            </SheetClose>
            
            <SheetClose asChild>
              <Link to="/chat">
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${currentPath === "/chat" ? "bg-secondary" : ""}`}
                >
                  Bate Papo
                </Button>
              </Link>
            </SheetClose>
            
            <SheetClose asChild>
              <Link to="/ai-chat">
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${currentPath === "/ai-chat" ? "bg-secondary" : ""}`}
                >
                  AI Chat
                </Button>
              </Link>
            </SheetClose>
            
            <SheetClose asChild>
              <Link to="/notes">
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${currentPath === "/notes" ? "bg-secondary" : ""}`}
                >
                  Notas
                </Button>
              </Link>
            </SheetClose>
          </nav>
          <Separator className="my-4" />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
