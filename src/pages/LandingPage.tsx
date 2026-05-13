
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Shield, Star, MapPin, ArrowRight, Users, Briefcase, Zap, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageSEO from '@/components/common/PageSEO';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }
  })
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }
  })
};

const categories = [
  { icon: '🔧', name: 'Encanador', count: '2.400+' },
  { icon: '⚡', name: 'Eletricista', count: '1.800+' },
  { icon: '🎨', name: 'Pintor', count: '3.100+' },
  { icon: '🏠', name: 'Limpeza', count: '5.200+' },
  { icon: '💻', name: 'Tecnologia', count: '4.600+' },
  { icon: '📸', name: 'Fotógrafo', count: '1.300+' },
  { icon: '🚚', name: 'Mudança', count: '900+' },
  { icon: '🔑', name: 'Chaveiro', count: '700+' },
];

const stats = [
  { value: '50K+', label: 'Profissionais ativos' },
  { value: '200K+', label: 'Serviços realizados' },
  { value: '4.8', label: 'Avaliação média' },
  { value: '98%', label: 'Satisfação' },
];

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 glass border-b border-border/50"
      >
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
              <span className="text-white font-bold text-base">H</span>
            </div>
            <span className="font-extrabold text-xl text-gradient-primary">HelpAqui</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#como-funciona" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Como funciona</a>
            <a href="#categorias" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Categorias</a>
            <a href="#profissionais" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Para profissionais</a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="font-medium">
                Entrar
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="gradient-primary text-white border-0 font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                Cadastrar grátis
              </Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative pt-16 pb-24 md:pt-24 md:pb-32">
        {/* BG decorations */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-secondary/5 blur-3xl" />
        </div>

        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6">
                <Zap className="h-4 w-4" />
                Plataforma #1 de serviços do Brasil
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp} initial="hidden" animate="visible" custom={1}
              className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6"
            >
              Encontre profissionais{' '}
              <span className="text-gradient-primary">qualificados</span>{' '}
              perto de você
            </motion.h1>

            <motion.p
              variants={fadeUp} initial="hidden" animate="visible" custom={2}
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
            >
              Conectamos você aos melhores freelancers e prestadores de serviço da sua região.
              Rápido, seguro e com garantia de qualidade.
            </motion.p>

            <motion.div
              variants={fadeUp} initial="hidden" animate="visible" custom={3}
              className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="O que você precisa? Ex: Eletricista, Pintor..."
                  className="h-13 pl-12 text-base rounded-xl border-border/80 bg-card shadow-sm"
                />
              </div>
              <Link to="/register">
                <Button className="h-13 px-8 gradient-primary text-white border-0 rounded-xl text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-xl transition-all w-full sm:w-auto">
                  Buscar
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              variants={fadeUp} initial="hidden" animate="visible" custom={4}
              className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground"
            >
              <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-primary" /> Pagamento seguro</span>
              <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-primary" /> Avaliações reais</span>
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" /> Perto de você</span>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={5}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 max-w-3xl mx-auto"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={scaleIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                className="text-center p-4"
              >
                <div className="text-3xl md:text-4xl font-extrabold text-gradient-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-20 bg-muted/50">
        <div className="container">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Como funciona</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Em 3 passos simples, você encontra o profissional ideal</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '01', icon: Search, title: 'Publique seu pedido', desc: 'Descreva o serviço que você precisa com detalhes e localização.' },
              { step: '02', icon: Users, title: 'Receba propostas', desc: 'Profissionais qualificados enviam propostas com preço e prazo.' },
              { step: '03', icon: CheckCircle2, title: 'Contrate com segurança', desc: 'Escolha o melhor profissional, pague com segurança e avalie.' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                variants={scaleIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                className="relative bg-card rounded-2xl p-8 shadow-sm border border-border/50 hover:shadow-lg hover:border-primary/20 transition-all duration-300 group"
              >
                <div className="absolute -top-4 left-8 text-xs font-bold gradient-primary text-white px-3 py-1 rounded-full">
                  Passo {item.step}
                </div>
                <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categorias" className="py-20">
        <div className="container">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Categorias populares</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Explore os serviços mais procurados na plataforma</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.name}
                variants={scaleIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
              >
                <Link
                  to="/register"
                  className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card hover:shadow-md hover:border-primary/20 transition-all duration-300 group"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                  <div>
                    <div className="font-semibold text-sm">{cat.name}</div>
                    <div className="text-xs text-muted-foreground">{cat.count} profissionais</div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* For Professionals CTA */}
      <section id="profissionais" className="py-20">
        <div className="container">
          <motion.div
            variants={scaleIn} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="gradient-primary rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzAtOS45NC04LjA2LTE4LTE4LTE4UzAgOC4wNiAwIDE4czguMDYgMTggMTggMThjOS45NCAwIDE4LTguMDYgMTgtMTgiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
            <div className="relative z-10">
              <Briefcase className="h-12 w-12 mx-auto mb-6 opacity-80" />
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">É profissional? Comece a ganhar mais!</h2>
              <p className="text-lg opacity-90 max-w-xl mx-auto mb-8">
                Cadastre-se gratuitamente e receba pedidos de clientes na sua região. Milhares de oportunidades esperando por você.
              </p>
              <Link to="/register">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-bold text-base px-10 rounded-xl shadow-lg">
                  Cadastrar como profissional
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 bg-muted/30">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="font-bold text-lg text-gradient-primary">HelpAqui</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacidade</a>
              <a href="#" className="hover:text-foreground transition-colors">Suporte</a>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} HelpAqui. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
