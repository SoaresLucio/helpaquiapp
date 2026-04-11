
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SubscriptionPlans from '@/components/subscription/SubscriptionPlans';
import Header from '@/components/Header';
import BackButton from '@/components/ui/back-button';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }
  })
};

const Subscription: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6"><BackButton to="/dashboard" label="Voltar ao Início" /></div>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-foreground mb-3">Planos de Assinatura</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Escolha o plano ideal para suas necessidades e tenha acesso aos melhores profissionais da sua região.
          </p>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}>
          <SubscriptionPlans />
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2} className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { emoji: '🛡️', title: 'Garantia de Qualidade', desc: 'Todos os profissionais são verificados e avaliados. Sua satisfação é garantida.' },
            { emoji: '⚡', title: 'Resposta Rápida', desc: 'Receba propostas de profissionais qualificados em minutos. Compare e escolha.' },
            { emoji: '💬', title: 'Suporte Dedicado', desc: 'Nossa equipe está disponível para ajudar. Suporte prioritário para premium.' },
          ].map((item, i) => (
            <motion.div key={item.title} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}>
              <Card className="rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-all group">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-2xl group-hover:scale-110 transition-transform">{item.emoji}</span>
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Subscription;
