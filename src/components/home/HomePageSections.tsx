import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  CheckCircle2,
  Users,
  Award,
  MapPin,
  ArrowRight,
  Zap,
  Shield,
  TrendingUp,
  Building2,
  UserPlus,
  HandHeart,
  DollarSign,
  Clock,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { serviceCategories } from '@/data/mockData';

// ---------------------------------------------------------------
// Animations
// ---------------------------------------------------------------
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

// ---------------------------------------------------------------
// Static data
// ---------------------------------------------------------------
const iconMap: Record<string, React.ElementType> = {
  cleaning: Sparkles,
  construction: Construction,
  repairs: Wrench,
  delivery: Bike,
  office: Briefcase,
  others: MoreHorizontal,
};

const stats = [
  { value: '50K+', label: 'Profissionais ativos', icon: Users },
  { value: '200K+', label: 'Serviços realizados', icon: CheckCircle2 },
  { value: '4.8★', label: 'Avaliação média', icon: Star },
  { value: '98%', label: 'Satisfação garantida', icon: Shield },
];

const audiencePaths = {
  solicitante: { register: '/register?type=solicitante', login: '/login' },
  freelancer: { register: '/register?type=freelancer', login: '/login' },
  empresa: { register: '/register?type=empresa', login: '/login' },
};

// ---------------------------------------------------------------
// HERO
// ---------------------------------------------------------------
const HeroSection: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleSearch = () => {
    const target = isAuthenticated ? '/offers' : '/register';
    if (searchValue.trim()) {
      navigate(`${target}?q=${encodeURIComponent(searchValue.trim())}`);
    } else {
      navigate(target);
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-accent py-20 md:py-28 px-4">
      {/* Decorative blobs */}
      <div className="absolute inset-0 -z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto text-center text-white">
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-sm font-medium mb-6"
        >
          <Zap className="h-4 w-4" />
          Plataforma #1 de serviços do Brasil
        </motion.span>

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6"
        >
          Conectamos talentos
          <br className="hidden sm:block" />
          <span className="text-white/90"> a oportunidades reais</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
          className="text-lg sm:text-xl text-white/85 mb-10 max-w-2xl mx-auto"
        >
          Encontre freelancers qualificados, contrate serviços com segurança ou
          divulgue vagas de emprego para milhares de profissionais.
        </motion.p>

        {/* Search */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={3}
          className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Que serviço você precisa? Ex: eletricista, designer..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-12 h-14 text-base rounded-full border-0 shadow-xl bg-white text-foreground"
            />
          </div>
          <Button
            onClick={handleSearch}
            className="h-14 px-8 rounded-full bg-white text-primary font-semibold hover:bg-white/95 shadow-xl text-base"
          >
            Buscar
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>

        {/* Quick categories */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={4}
          className="flex flex-wrap justify-center gap-2 mt-8"
        >
          {serviceCategories.slice(0, 8).map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigate(isAuthenticated ? '/offers' : '/register')}
              className="px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white text-sm hover:bg-white/25 transition-colors border border-white/20"
            >
              {cat.name}
            </button>
          ))}
        </motion.div>

        {/* Trust signals */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={5}
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-10 text-sm text-white/80"
        >
          <span className="flex items-center gap-1.5"><Shield className="h-4 w-4" /> Pagamento seguro</span>
          <span className="flex items-center gap-1.5"><Star className="h-4 w-4" /> Avaliações reais</span>
          <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> Perto de você</span>
        </motion.div>
      </div>
    </section>
  );
};

// ---------------------------------------------------------------
// STATS
// ---------------------------------------------------------------
const StatsBar: React.FC = () => (
  <section className="bg-muted/40 border-y border-border py-12 px-4">
    <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={i}
            className="flex flex-col items-center text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <p className="text-2xl md:text-3xl font-extrabold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        );
      })}
    </div>
  </section>
);

// ---------------------------------------------------------------
// AUDIENCE OPPORTUNITIES — 3 cards (Solicitante / Freelancer / Empresa)
// ---------------------------------------------------------------
const audiences = [
  {
    type: 'solicitante' as const,
    icon: HandHeart,
    title: 'Para Solicitantes',
    subtitle: 'Precisa de um serviço?',
    description: 'Publique seu pedido e receba propostas de profissionais qualificados em minutos.',
    benefits: [
      'Receba múltiplas propostas',
      'Compare preços e avaliações',
      'Pagamento 100% seguro',
      'Suporte dedicado 24/7',
    ],
    cta: 'Solicitar serviço',
    gradient: 'from-primary/90 to-accent/90',
    badge: 'Grátis',
  },
  {
    type: 'freelancer' as const,
    icon: Briefcase,
    title: 'Para Freelancers',
    subtitle: 'Quer ganhar mais?',
    description: 'Receba pedidos da sua região, monte seu portfólio e construa sua reputação.',
    benefits: [
      'Milhares de oportunidades',
      'Receba pagamentos seguros',
      'Crie seu portfólio profissional',
      'Construa sua reputação',
    ],
    cta: 'Cadastrar como freelancer',
    gradient: 'from-accent/90 to-primary/90',
    badge: 'Mais procurado',
  },
  {
    type: 'empresa' as const,
    icon: Building2,
    title: 'Para Empresas',
    subtitle: 'Contratando talentos?',
    description: 'Divulgue vagas de emprego CLT ou temporárias e encontre os melhores candidatos.',
    benefits: [
      'Publique vagas ilimitadas',
      'Acesse banco de talentos',
      'Gerencie candidaturas',
      'Recrutamento simplificado',
    ],
    cta: 'Cadastrar empresa',
    gradient: 'from-primary/90 via-accent/80 to-primary/90',
    badge: 'CLT & Temporário',
  },
];

const AudienceOpportunitiesSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <Badge className="mb-4 bg-primary/10 text-primary border-0 hover:bg-primary/15">
            Oportunidades para todos
          </Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            Uma plataforma, três grandes oportunidades
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Não importa se você precisa de ajuda, oferece serviços ou contrata talentos —
            o HelpAqui foi feito para você.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {audiences.map((audience, i) => {
            const Icon = audience.icon;
            return (
              <motion.div
                key={audience.type}
                variants={scaleIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                className="group relative"
              >
                <Card className="h-full overflow-hidden border-border hover:border-primary/30 hover:shadow-2xl transition-all duration-300 rounded-2xl">
                  {/* Top gradient header */}
                  <div className={`relative bg-gradient-to-br ${audience.gradient} p-6 text-white`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <Badge className="bg-white/25 text-white border-0 backdrop-blur-sm">
                        {audience.badge}
                      </Badge>
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{audience.title}</h3>
                    <p className="text-white/85 text-sm">{audience.subtitle}</p>
                  </div>

                  <CardContent className="p-6">
                    <p className="text-muted-foreground mb-5 leading-relaxed">
                      {audience.description}
                    </p>

                    <ul className="space-y-2.5 mb-6">
                      {audience.benefits.map((benefit) => (
                        <li key={benefit} className="flex items-start gap-2 text-sm text-foreground">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => navigate(audiencePaths[audience.type].register)}
                      className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold group/btn"
                    >
                      {audience.cta}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ---------------------------------------------------------------
// CATEGORIES
// ---------------------------------------------------------------
const CategoriesSection: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            Explore por categoria
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Profissionais especializados nas mais diversas áreas
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {serviceCategories.map((category, i) => {
            const Icon = iconMap[category.icon] || Sparkles;
            return (
              <motion.button
                key={category.id}
                variants={scaleIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                onClick={() => navigate(isAuthenticated ? '/offers' : '/register')}
                className="flex flex-col items-center justify-center p-5 rounded-2xl bg-card border border-border shadow-sm hover:shadow-lg hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <span className="text-sm font-semibold text-foreground text-center leading-tight">
                  {category.name}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ---------------------------------------------------------------
// HOW IT WORKS
// ---------------------------------------------------------------
const howItWorksSteps = [
  {
    number: '01',
    icon: ClipboardList,
    title: 'Descreva o que precisa',
    description: 'Publique sua solicitação com detalhes sobre o serviço, local e prazo.',
  },
  {
    number: '02',
    icon: MessageSquare,
    title: 'Receba propostas',
    description: 'Profissionais qualificados da sua região enviam orçamentos personalizados.',
  },
  {
    number: '03',
    icon: CheckCircle,
    title: 'Contrate e avalie',
    description: 'Escolha o profissional ideal, contrate com segurança e deixe sua avaliação.',
  },
];

const HowItWorksSection: React.FC = () => (
  <section className="py-20 px-4 bg-background">
    <div className="max-w-6xl mx-auto">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
          Como funciona
        </h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Em 3 passos simples você encontra o profissional certo
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {howItWorksSteps.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.number}
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              className="relative"
            >
              <Card className="h-full p-8 rounded-2xl border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="absolute -top-3 left-8 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-white text-xs font-bold">
                  Passo {step.number}
                </div>
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

// ---------------------------------------------------------------
// WHY CHOOSE US (trust)
// ---------------------------------------------------------------
const benefits = [
  { icon: Shield, title: 'Pagamento Protegido', description: 'Seu dinheiro fica seguro até o serviço ser concluído.' },
  { icon: Star, title: 'Profissionais Avaliados', description: 'Sistema transparente de avaliações e reviews reais.' },
  { icon: Clock, title: 'Resposta Rápida', description: 'Receba propostas em poucos minutos após publicar.' },
  { icon: Target, title: 'Match Perfeito', description: 'Algoritmo inteligente conecta você ao profissional ideal.' },
  { icon: DollarSign, title: 'Sem Taxas Ocultas', description: 'Preços transparentes, sem surpresas.' },
  { icon: TrendingUp, title: 'Crescimento Garantido', description: 'Para profissionais: aumente sua renda mensalmente.' },
];

const WhyChooseSection: React.FC = () => (
  <section className="py-20 px-4 bg-muted/30">
    <div className="max-w-6xl mx-auto">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <Badge className="mb-4 bg-accent/10 text-accent border-0 hover:bg-accent/15">
          Por que escolher o HelpAqui
        </Badge>
        <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
          Tudo que você precisa em um só lugar
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Mais que uma plataforma — uma comunidade comprometida com qualidade e segurança.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {benefits.map((benefit, i) => {
          const Icon = benefit.icon;
          return (
            <motion.div
              key={benefit.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              className="flex gap-4 p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-1">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

// ---------------------------------------------------------------
// FINAL CTA
// ---------------------------------------------------------------
const CTASection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={scaleIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-accent p-10 md:p-16 text-center text-white"
        >
          <div className="absolute inset-0 -z-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <UserPlus className="h-12 w-12 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
              Pronto para começar?
            </h2>
            <p className="text-white/90 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              Cadastre-se gratuitamente em menos de 2 minutos e comece a aproveitar
              tudo que o HelpAqui tem a oferecer.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/register')}
                size="lg"
                className="h-13 px-8 rounded-xl bg-white text-primary font-bold hover:bg-white/95 shadow-xl text-base"
              >
                Cadastrar grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                onClick={() => navigate('/login')}
                size="lg"
                variant="outline"
                className="h-13 px-8 rounded-xl border-2 border-white text-white bg-transparent hover:bg-white/15 font-bold text-base"
              >
                Já tenho conta
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ---------------------------------------------------------------
// MAIN EXPORT
// ---------------------------------------------------------------
const HomePageSections: React.FC = () => (
  <>
    <HeroSection />
    <StatsBar />
    <AudienceOpportunitiesSection />
    <CategoriesSection />
    <HowItWorksSection />
    <WhyChooseSection />
    <CTASection />
  </>
);

export default HomePageSections;
