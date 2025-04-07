import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bell, 
  MessageSquare, 
  User, 
  Menu, 
  X,
  Search,
  Sun,
  Moon,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { currentUser } from '@/data/mockData';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState('light');
  const [userType, setUserType] = useState('solicitante');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    
    const savedUserType = localStorage.getItem('userType') || 'solicitante';
    setUserType(savedUserType);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setIsOpen(false);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
      <div className="helpaqui-container py-2">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-helpaqui-blue dark:text-helpaqui-blue">Help<span className="text-helpaqui-green dark:text-helpaqui-green">Aqui</span></span>
          </Link>

          <div className="hidden md:block flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Buscar serviços..."
                className="helpaqui-input w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                type="submit" 
                variant="ghost" 
                className="absolute right-0 top-0 h-full px-3"
                aria-label="Buscar"
              >
                <Search className="h-5 w-5 text-gray-500 dark:text-gray-300" />
              </Button>
            </form>
          </div>

          <nav className="hidden md:flex items-center space-x-4">
            <Link to="/notifications" className="relative">
              <Bell className="h-6 w-6 text-helpaqui-darkGray dark:text-gray-300" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                3
              </span>
            </Link>
            <Link to="/messages">
              <MessageSquare className="h-6 w-6 text-helpaqui-darkGray dark:text-gray-300" />
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-helpaqui-blue flex items-center justify-center text-white overflow-hidden">
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleProfileClick} className="w-full flex items-center cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/verification" className="w-full flex items-center cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Verificação de Cadastro</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
                  {theme === 'light' ? (
                    <>
                      <Moon className="mr-2 h-4 w-4" />
                      <span>Modo Escuro</span>
                    </>
                  ) : (
                    <>
                      <Sun className="mr-2 h-4 w-4" />
                      <span>Modo Claro</span>
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {userType === 'solicitante' ? (
              <Button className="helpaqui-button-primary">
                Pedir um HELP
              </Button>
            ) : (
              <Button className="helpaqui-button-green">
                Oferecer um HELP
              </Button>
            )}
          </nav>

          <div className="md:hidden">
            <Button variant="ghost" onClick={toggleMenu} aria-label="Menu">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden mt-2 pb-2">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Buscar serviços..."
                  className="helpaqui-input w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button 
                  type="submit" 
                  variant="ghost" 
                  className="absolute right-0 top-0 h-full px-3"
                  aria-label="Buscar"
                >
                  <Search className="h-5 w-5 text-gray-500 dark:text-gray-300" />
                </Button>
              </div>
            </form>
            <div className="flex flex-col space-y-2">
              <Link to="/notifications" className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Bell className="h-5 w-5 mr-2 text-helpaqui-darkGray dark:text-gray-300" />
                <span>Notificações</span>
                <span className="ml-auto bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  3
                </span>
              </Link>
              <Link to="/messages" className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <MessageSquare className="h-5 w-5 mr-2 text-helpaqui-darkGray dark:text-gray-300" />
                <span>Mensagens</span>
              </Link>
              <button 
                onClick={handleProfileClick}
                className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <User className="h-5 w-5 mr-2 text-helpaqui-darkGray dark:text-gray-300" />
                <span>Meu Perfil</span>
              </button>
              <Link to="/verification" className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Settings className="h-5 w-5 mr-2 text-helpaqui-darkGray dark:text-gray-300" />
                <span>Verificação de Cadastro</span>
              </Link>
              <button 
                className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                onClick={toggleTheme}
              >
                {theme === 'light' ? (
                  <>
                    <Moon className="h-5 w-5 mr-2 text-helpaqui-darkGray dark:text-gray-300" />
                    <span>Modo Escuro</span>
                  </>
                ) : (
                  <>
                    <Sun className="h-5 w-5 mr-2 text-helpaqui-darkGray dark:text-gray-300" />
                    <span>Modo Claro</span>
                  </>
                )}
              </button>
              {userType === 'solicitante' ? (
                <Button className="helpaqui-button-primary w-full">
                  Pedir um HELP
                </Button>
              ) : (
                <Button className="helpaqui-button-green w-full">
                  Oferecer um HELP
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
