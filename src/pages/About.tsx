import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BackButton from '@/components/ui/back-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Instagram, 
  MessageCircle,
  FileText,
  Shield,
  Users,
  Heart
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AppInfo {
  company_name?: string;
  description?: string;
  cnpj?: string;
  address?: string;
  email?: string;
  phone?: string;
  instagram?: string;
  whatsapp?: string;
  terms_url?: string;
  privacy_url?: string;
  founded_year?: string;
  mission?: string;
  vision?: string;
  values?: string[];
}

const About = () => {
  const [appInfo, setAppInfo] = useState<AppInfo>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppInfo = async () => {
      try {
        const { data, error } = await supabase
          .from('app_configurations')
          .select('key, value')
          .in('key', [
            'company_name',
            'description', 
            'cnpj',
            'address',
            'email',
            'phone',
            'instagram',
            'whatsapp',
            'terms_url',
            'privacy_url',
            'founded_year',
            'mission',
            'vision',
            'values'
          ]);

        if (error) throw error;

        const configMap: AppInfo = {};
        data?.forEach(config => {
          configMap[config.key as keyof AppInfo] = config.value as any;
        });

        setAppInfo(configMap);
      } catch (error) {
        console.error('Error fetching app info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppInfo();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p>Carregando informações...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <BackButton to="/dashboard" label="Voltar ao Início" />
        </div>

        {/* Header Section */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-helpaqui-blue mb-4">
              {appInfo.company_name || 'HelpAqui'}
            </CardTitle>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {appInfo.description || 'Conectando pessoas que precisam de ajuda com profissionais qualificados'}
            </p>
            {appInfo.founded_year && (
              <Badge variant="outline" className="mt-4">
                Fundado em {appInfo.founded_year}
              </Badge>
            )}
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Missão */}
          {appInfo.mission && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Nossa Missão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{appInfo.mission}</p>
              </CardContent>
            </Card>
          )}

          {/* Visão */}
          {appInfo.vision && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Nossa Visão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{appInfo.vision}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Valores */}
        {appInfo.values && appInfo.values.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                Nossos Valores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {appInfo.values.map((value, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium text-center">{value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informações de Contato */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-helpaqui-blue" />
              Informações da Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {appInfo.cnpj && (
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">CNPJ</p>
                  <p className="text-gray-600">{appInfo.cnpj}</p>
                </div>
              </div>
            )}

            {appInfo.address && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">Endereço</p>
                  <p className="text-gray-600">{appInfo.address}</p>
                </div>
              </div>
            )}

            {appInfo.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">E-mail</p>
                  <a href={`mailto:${appInfo.email}`} className="text-helpaqui-blue hover:underline">
                    {appInfo.email}
                  </a>
                </div>
              </div>
            )}

            {appInfo.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">Telefone</p>
                  <a href={`tel:${appInfo.phone}`} className="text-helpaqui-blue hover:underline">
                    {appInfo.phone}
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Redes Sociais */}
        {(appInfo.instagram || appInfo.whatsapp) && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Redes Sociais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {appInfo.instagram && (
                  <a
                    href={appInfo.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <Instagram className="h-5 w-5" />
                    Instagram
                  </a>
                )}

                {appInfo.whatsapp && (
                  <a
                    href={appInfo.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <MessageCircle className="h-5 w-5" />
                    WhatsApp
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Links Legais */}
        {(appInfo.terms_url || appInfo.privacy_url) && (
          <Card>
            <CardHeader>
              <CardTitle>Termos e Políticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {appInfo.terms_url && (
                  <a
                    href={appInfo.terms_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-helpaqui-blue hover:underline flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Termos de Uso
                  </a>
                )}

                {appInfo.privacy_url && (
                  <a
                    href={appInfo.privacy_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-helpaqui-blue hover:underline flex items-center gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    Política de Privacidade
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default About;