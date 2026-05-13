
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import BackButton from '@/components/ui/back-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Mail, Phone, MapPin, Instagram, MessageCircle, FileText, Shield, Users, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import PageSEO from '@/components/common/PageSEO';

interface AppInfo {
  company_name?: string; description?: string; cnpj?: string; address?: string; email?: string;
  phone?: string; instagram?: string; whatsapp?: string; terms_url?: string; privacy_url?: string;
  founded_year?: string; mission?: string; vision?: string; values?: string[];
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] } })
};

const About = () => {
  const [appInfo, setAppInfo] = useState<AppInfo>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppInfo = async () => {
      try {
        const { data, error } = await supabase.from('app_configurations').select('key, value')
          .in('key', ['company_name','description','cnpj','address','email','phone','instagram','whatsapp','terms_url','privacy_url','founded_year','mission','vision','values']);
        if (error) throw error;
        const configMap: AppInfo = {};
        data?.forEach(config => { configMap[config.key as keyof AppInfo] = config.value as any; });
        setAppInfo(configMap);
      } catch (error) { console.error('Error fetching app info:', error); }
      finally { setLoading(false); }
    };
    fetchAppInfo();
  }, []);

  if (loading) {
    return (<div className="min-h-screen bg-background"><Header /><div className="container mx-auto px-4 py-8 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div></div></div>);
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6"><BackButton to="/dashboard" label="Voltar ao Início" /></div>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
          <Card className="mb-8 rounded-2xl border-border/50 shadow-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-extrabold text-gradient-primary mb-4">{appInfo.company_name || 'HelpAqui'}</CardTitle>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{appInfo.description || 'Conectando pessoas que precisam de ajuda com profissionais qualificados'}</p>
              {appInfo.founded_year && <Badge variant="outline" className="mt-4 rounded-full">Fundado em {appInfo.founded_year}</Badge>}
            </CardHeader>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {appInfo.mission && (
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}>
              <Card className="rounded-2xl border-border/50 shadow-sm h-full"><CardHeader><CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5 text-primary" />Nossa Missão</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">{appInfo.mission}</p></CardContent></Card>
            </motion.div>
          )}
          {appInfo.vision && (
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}>
              <Card className="rounded-2xl border-border/50 shadow-sm h-full"><CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-secondary" />Nossa Visão</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">{appInfo.vision}</p></CardContent></Card>
            </motion.div>
          )}
        </div>

        {appInfo.values && appInfo.values.length > 0 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}>
            <Card className="mb-8 rounded-2xl border-border/50 shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" />Nossos Valores</CardTitle></CardHeader>
              <CardContent><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{appInfo.values.map((value, index) => (<div key={index} className="bg-accent/50 p-4 rounded-xl"><p className="font-medium text-center text-foreground">{value}</p></div>))}</div></CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}>
          <Card className="mb-8 rounded-2xl border-border/50 shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" />Informações da Empresa</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {appInfo.cnpj && <div className="flex items-center gap-3"><FileText className="h-5 w-5 text-muted-foreground" /><div><p className="font-medium text-foreground">CNPJ</p><p className="text-muted-foreground">{appInfo.cnpj}</p></div></div>}
              {appInfo.address && <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-muted-foreground" /><div><p className="font-medium text-foreground">Endereço</p><p className="text-muted-foreground">{appInfo.address}</p></div></div>}
              {appInfo.email && <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-muted-foreground" /><div><p className="font-medium text-foreground">E-mail</p><a href={`mailto:${appInfo.email}`} className="text-primary hover:underline">{appInfo.email}</a></div></div>}
              {appInfo.phone && <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-muted-foreground" /><div><p className="font-medium text-foreground">Telefone</p><a href={`tel:${appInfo.phone}`} className="text-primary hover:underline">{appInfo.phone}</a></div></div>}
            </CardContent>
          </Card>
        </motion.div>

        {(appInfo.instagram || appInfo.whatsapp) && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={5}>
            <Card className="mb-8 rounded-2xl border-border/50 shadow-sm"><CardHeader><CardTitle>Redes Sociais</CardTitle></CardHeader>
              <CardContent><div className="flex gap-4">
                {appInfo.instagram && <a href={appInfo.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 gradient-primary text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"><Instagram className="h-5 w-5" />Instagram</a>}
                {appInfo.whatsapp && <a href={appInfo.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors"><MessageCircle className="h-5 w-5" />WhatsApp</a>}
              </div></CardContent>
            </Card>
          </motion.div>
        )}

        {(appInfo.terms_url || appInfo.privacy_url) && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={6}>
            <Card className="rounded-2xl border-border/50 shadow-sm"><CardHeader><CardTitle>Termos e Políticas</CardTitle></CardHeader>
              <CardContent><div className="flex flex-wrap gap-4">
                {appInfo.terms_url && <a href={appInfo.terms_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-2"><FileText className="h-4 w-4" />Termos de Uso</a>}
                {appInfo.privacy_url && <a href={appInfo.privacy_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-2"><Shield className="h-4 w-4" />Política de Privacidade</a>}
              </div></CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default About;
