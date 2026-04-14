import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  Construction,
  Wrench,
  Bike,
  Briefcase,
  MoreHorizontal,
  ClipboardList,
  MessageSquare,
  Star,
  CheckCircle,
  Users,
  Award,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { serviceCategories } from '@/data/mockData';

// ---------------------------------------------------------------
// Icon map for categories
// ---------------------------------------------------------------
const iconMap: Record<string, React.ElementType> = {
  cleaning: Sparkles,
  construction: Construction,
  repairs: Wrench,
  delivery: Bike,
  office: Briefcase,
  others: MoreHorizontal,
};

// ---------------------------------------------------------------
// Static data
// ---------------------------------------------------------------
const stats = [
  { value: '500+', label: 'Profissionais' },
  { value: '1.000+', label: 'Serviços realizados' },
  { value: '50+', label: 'Cidades atendidas' },
  { value: '4.8★', label: 'Avaliação média' },
];

const howItWorksSteps = [
  {
    number: '01',
    icon: ClipboardList,
    title: 'Descreva o que precisa',
    description: 'Publique sua solicitação com detalhes sobre o serviço, local e prazo desejado.',
  },
  {
    number: '02',
    icon: MessageSquare,
    title: 'Receba propostas',
    description: 'Profissionais qualificados da sua região entram em contato com orçamentos.',
  },
  {
    number: '03',
    icon: CheckCircle,
    title: 'Contrate e avalie',
    description: 'Escolha o profissional ideal, contrate com segurança e deixe sua avaliação.',
  },
];

const featuredProfessionals = [
  {
    id: '1',
    name: 'João Silva',
    specialty: 'Especialista em limpeza residencial',
    rating: 4.8,
    reviews: 125,
    location: 'São Paulo, SP',
    initials: 'JS',
    colorClass: 'bg-helpaqui-blue',
    isVerified: true,
  },
  {
    id: '2',
    name: 'Maria Oliveira',
    specialty: 'Eletricista residencial e comercial',
    rating: 4.9,
    reviews: 210,
    location: 'São Paulo, SP',
    initials: 'MO',
    colorClass: 'bg-helpaqui-green',
    isVerified: true,
  },
  {
    id: '3',
    name: 'Ana Souza',
    specialty: 'Pedreiro — reformas e acabamentos',
    rating: 4.9,
    reviews: 156,
    location: 'São Paulo, SP',
    initials: 'AS',
    colorClass: 'bg-helpaqui-blue',
    isVerified: true,
  },
  {
    id: '4',
    name: 'Pedro Santos',
    specialty: 'Motoboy — entrega rápida e segura',
    rating: 4.7,
    reviews: 98,
    location: 'São Paulo, SP',
    initials: 'PS',
    colorClass: 'bg-helpaqui-green',
    isVerified: false,
  },
];

// ---------------------------------------------------------------
// HERO SECTION
// ---------------------------------------------------------------
const HeroSection: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchValue.trim()) {
      navigate(`/offers?q=${encodeURIComponent(searchValue.trim())}`);
    } else {
      navigate('/offers');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <section className="bg-gradient-to-br from-helpaqui-blue to-helpaqui-green py-20 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
          Encontre o profissional ideal
          <br className="hidden sm:block" />
          <span className="text-white/90"> para o seu serviço</span>
        </h1>
        <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
          Conectamos você aos melhores prestadores de serviço da sua região de forma rápida, segura e confiável.
        </p>

        {/* Search bar */}
        <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Que serviço você precisa? Ex: eletricista, limpeza..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-12 h-14 text-base rounded-full border-0 shadow-lg focus-visible:ring-white/50 focus-visible:ring-2"
            />
          </div>
          <Button
            onClick={handleSearch}
            className="h-14 px-8 rounded-full bg-white text-helpaqui-blue font-semibold hover:bg-white/90 transition-all shadow-lg text-base"
          >
            Buscar
          </Button>
        </div>

        {/* Quick category pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {serviceCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigate('/offers')}
              className="px-4 py-1.5 rounded-full bg-white/20 text-white text-sm hover:bg-white/30 transition-colors border border-white/30"
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

// ---------------------------------------------------------------
// STATS BAR
// ---------------------------------------------------------------
const StatsBar: React.FC = () => {
  return (
    <section className="bg-gray-50 border-b border-gray-100 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {stats.map((stat) => (
            <div key={stat.label} className="space-y-1">
              <p className="text-3xl font-bold text-helpaqui-blue">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ---------------------------------------------------------------
// CATEGORIES SECTION
// ---------------------------------------------------------------
const CategoriesSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">
          Explore por categoria
        </h2>
        <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
          Encontre profissionais especializados em diversas áreas para atender às suas necessidades
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {serviceCategories.map((category) => {
            const Icon = iconMap[category.icon] || Sparkles;
            return (
              <button
                key={category.id}
                onClick={() => navigate('/offers')}
                className="flex flex-col items-center justify-center p-5 rounded-xl bg-gray-50 border border-gray-100 shadow-sm hover:shadow-md hover:border-helpaqui-blue/30 hover:-translate-y-0.5 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-helpaqui-blue/10 flex items-center justify-center mb-3 group-hover:bg-helpaqui-blue/20 transition-colors">
                  <Icon className="h-6 w-6 text-helpaqui-blue" />
                </div>
                <span className="text-sm font-medium text-gray-700 text-center leading-tight">
                  {category.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ---------------------------------------------------------------
// HOW IT WORKS SECTION
// ---------------------------------------------------------------
const HowItWorksSection: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">
          Como funciona
        </h2>
        <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
          Em poucos passos você encontra o profissional certo para o seu serviço
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {howItWorksSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative flex flex-col items-center text-center">
                {/* Connector line between steps (visible on md+) */}
                {index < howItWorksSteps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+2.5rem)] w-[calc(100%-5rem)] h-0.5 bg-helpaqui-blue/20" />
                )}

                {/* Step number + icon */}
                <div className="relative mb-5">
                  <div className="w-16 h-16 rounded-full bg-helpaqui-blue flex items-center justify-center shadow-md">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-helpaqui-green text-white text-xs font-bold flex items-center justify-center">
                    {step.number.slice(-1)}
                  </span>
                </div>

                <Card className="w-full shadow-sm border-gray-100 rounded-xl">
                  <CardContent className="pt-6 pb-6">
                    <h3 className="font-semibold text-gray-900 text-lg mb-2">{step.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ---------------------------------------------------------------
// FEATURED PROFESSIONALS SECTION
// ---------------------------------------------------------------
const FeaturedProfessionalsSection: React.FC = () => {
  const navigate = useNavigate();

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-3.5 w-3.5 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">
          Profissionais prontos para te ajudar
        </h2>
        <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
          Conheça alguns dos profissionais mais bem avaliados da nossa plataforma
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProfessionals.map((pro) => (
            <Card
              key={pro.id}
              className="shadow-sm hover:shadow-md transition-all rounded-xl border-gray-100 cursor-pointer group"
              onClick={() => navigate('/offers')}
            >
              <CardContent className="pt-6 pb-5 flex flex-col items-center text-center">
                {/* Avatar placeholder */}
                <div className={`w-16 h-16 rounded-full ${pro.colorClass} flex items-center justify-center text-white font-bold text-xl mb-3 shadow-sm`}>
                  {pro.initials}
                </div>

                {/* Name + verified badge */}
                <div className="flex items-center gap-1.5 mb-1">
                  <h3 className="font-semibold text-gray-900">{pro.name}</h3>
                  {pro.isVerified && (
                    <Award className="h-4 w-4 text-helpaqui-blue flex-shrink-0" />
                  )}
                </div>

                <p className="text-xs text-gray-500 mb-3 leading-tight">{pro.specialty}</p>

                {/* Stars */}
                <div className="flex items-center gap-1 mb-2">
                  {renderStars(pro.rating)}
                  <span className="text-xs text-gray-600 ml-1">{pro.rating} ({pro.reviews})</span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
                  <MapPin className="h-3 w-3" />
                  <span>{pro.location}</span>
                </div>

                {/* Badges */}
                <div className="flex gap-1.5 flex-wrap justify-center">
                  {pro.isVerified && (
                    <Badge variant="secondary" className="text-xs bg-helpaqui-blue/10 text-helpaqui-blue border-0">
                      Verificado
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600 border-0">
                    Disponível
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button
            variant="outline"
            onClick={() => navigate('/offers')}
            className="rounded-full px-8 py-3 border-helpaqui-blue text-helpaqui-blue hover:bg-helpaqui-blue hover:text-white transition-colors"
          >
            Ver todos os profissionais
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

// ---------------------------------------------------------------
// CTA SECTION
// ---------------------------------------------------------------
const CTASection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4 bg-gradient-to-r from-helpaqui-blue to-helpaqui-green">
      <div className="max-w-6xl mx-auto text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <Users className="h-6 w-6 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">
          Pronto para encontrar ajuda?
        </h2>
        <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
          Junte-se a milhares de pessoas que já encontraram o profissional certo pelo HelpAqui.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate('/jobs')}
            className="h-13 px-8 py-3 rounded-full bg-white text-helpaqui-blue font-semibold hover:bg-white/90 transition-all shadow-lg text-base"
          >
            Solicitar serviço
          </Button>
          <Button
            onClick={() => navigate('/offers')}
            variant="outline"
            className="h-13 px-8 py-3 rounded-full border-2 border-white text-white bg-transparent hover:bg-white/10 transition-all font-semibold text-base"
          >
            Oferecer serviço
          </Button>
        </div>
      </div>
    </section>
  );
};

// ---------------------------------------------------------------
// MAIN EXPORT — all sections composed
// ---------------------------------------------------------------
const HomePageSections: React.FC = () => {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <CategoriesSection />
      <HowItWorksSection />
      <FeaturedProfessionalsSection />
      <CTASection />
    </>
  );
};

export default HomePageSections;
