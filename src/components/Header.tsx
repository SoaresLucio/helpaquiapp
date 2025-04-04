
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  MessageSquare, 
  User, 
  Menu, 
  X,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { currentUser } from '@/data/mockData';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    // Implementação de busca futura
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="helpaqui-container py-2">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-helpaqui-blue">Help<span className="text-helpaqui-green">Aqui</span></span>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Buscar serviços..."
                className="helpaqui-input w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                type="submit" 
                variant="ghost" 
                className="absolute right-0 top-0 h-full px-3"
                aria-label="Buscar"
              >
                <Search className="h-5 w-5 text-gray-500" />
              </Button>
            </form>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link to="/notifications" className="relative">
              <Bell className="h-6 w-6 text-helpaqui-darkGray" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                3
              </span>
            </Link>
            <Link to="/messages">
              <MessageSquare className="h-6 w-6 text-helpaqui-darkGray" />
            </Link>
            <Link to="/profile" className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-helpaqui-blue flex items-center justify-center text-white overflow-hidden">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </div>
            </Link>
            <Button className="helpaqui-button-primary">Publicar Serviço</Button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" onClick={toggleMenu} aria-label="Menu">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-2 pb-2">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Buscar serviços..."
                  className="helpaqui-input w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button 
                  type="submit" 
                  variant="ghost" 
                  className="absolute right-0 top-0 h-full px-3"
                  aria-label="Buscar"
                >
                  <Search className="h-5 w-5 text-gray-500" />
                </Button>
              </div>
            </form>
            <div className="flex flex-col space-y-2">
              <Link to="/notifications" className="flex items-center p-2 hover:bg-gray-100 rounded-lg">
                <Bell className="h-5 w-5 mr-2 text-helpaqui-darkGray" />
                <span>Notificações</span>
                <span className="ml-auto bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  3
                </span>
              </Link>
              <Link to="/messages" className="flex items-center p-2 hover:bg-gray-100 rounded-lg">
                <MessageSquare className="h-5 w-5 mr-2 text-helpaqui-darkGray" />
                <span>Mensagens</span>
              </Link>
              <Link to="/profile" className="flex items-center p-2 hover:bg-gray-100 rounded-lg">
                <User className="h-5 w-5 mr-2 text-helpaqui-darkGray" />
                <span>Meu Perfil</span>
              </Link>
              <Button className="helpaqui-button-primary w-full">Publicar Serviço</Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
