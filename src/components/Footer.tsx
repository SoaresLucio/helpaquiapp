
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Clock, Phone, Mail, MapPin } from 'lucide-react';
import SocialMediaLinks from '@/components/SocialMediaLinks';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-gray-900 text-gray-300 py-12 mt-16 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Sobre o HelpAqui */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">HelpAqui</h3>
            <p className="text-sm mb-4">
              Conectamos pessoas que precisam de serviços com profissionais qualificados. 
              Uma plataforma segura e confiável para todas as suas necessidades.
            </p>
            <div className="flex items-center text-sm mb-2">
              <Shield className="h-4 w-4 mr-2 text-green-400" />
              <span>Pagamentos seguros</span>
            </div>
            <div className="flex items-center text-sm mb-2">
              <Clock className="h-4 w-4 mr-2 text-blue-400" />
              <span>Suporte 24/7</span>
            </div>
            <div className="flex items-center text-sm">
              <Heart className="h-4 w-4 mr-2 text-red-400" />
              <span>Satisfação garantida</span>
            </div>
          </div>

          {/* Links Úteis */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Links Úteis</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Sobre nós
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">
                  Como funciona
                </Link>
              </li>
              <li>
                <Link to="/safety" className="hover:text-white transition-colors">
                  Segurança
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-white transition-colors">
                  Central de ajuda
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Para Profissionais */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Para Profissionais</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/freelancer-plans" className="hover:text-white transition-colors">
                  Planos para freelancers
                </Link>
              </li>
              <li>
                <Link to="/become-professional" className="hover:text-white transition-colors">
                  Torne-se um profissional
                </Link>
              </li>
              <li>
                <Link to="/professional-tips" className="hover:text-white transition-colors">
                  Dicas profissionais
                </Link>
              </li>
              <li>
                <Link to="/success-stories" className="hover:text-white transition-colors">
                  Histórias de sucesso
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Contato</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>(11) 99999-9999</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>contato@helpaqui.com</span>
              </div>
              <div className="flex items-start">
                <MapPin className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                <span>São Paulo, SP<br />Brasil</span>
              </div>
            </div>
            
            {/* Redes Sociais */}
            <div className="mt-6">
              <h4 className="text-white font-medium mb-3">Siga-nos</h4>
              <SocialMediaLinks variant="footer" />
            </div>
          </div>
        </div>

        {/* Linha divisória */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              © {currentYear} HelpAqui. Todos os direitos reservados.
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Política de Privacidade
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                Termos de Uso
              </Link>
              <Link to="/cookies" className="text-gray-400 hover:text-white transition-colors">
                Política de Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
