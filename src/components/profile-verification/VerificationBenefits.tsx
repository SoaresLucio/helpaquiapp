
import React from 'react';
import { BadgeCheck, ShieldCheck, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

const VerificationBenefits: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Benefícios da Verificação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              <BadgeCheck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium">Selo de Verificação</h3>
              <p className="text-sm text-gray-500">Destaque-se com um selo de verificação no seu perfil</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium">Mais Confiança</h3>
              <p className="text-sm text-gray-500">Clientes tendem a escolher profissionais verificados</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-purple-100 p-2 rounded-full">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium">Prioridade nas Buscas</h3>
              <p className="text-sm text-gray-500">Apareça antes dos não verificados nos resultados</p>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="font-medium mb-2">Processo de Verificação</h3>
          <ScrollArea className="h-[200px] rounded-md border p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">1. Envio de Documentos</h4>
                <p className="text-xs text-gray-600">
                  Envie todos os documentos solicitados. Certifique-se de que as imagens estejam nítidas e legíveis.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">2. Validação Automática</h4>
                <p className="text-xs text-gray-600">
                  Nosso sistema faz uma validação inicial de autenticidade dos seus documentos e verifica se o CPF está regularizado.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">3. Análise de Documentos</h4>
                <p className="text-xs text-gray-600">
                  Nossa equipe analisa os documentos enviados para confirmar sua veracidade. Este processo pode levar até 3 dias úteis.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">4. Verificação Completa</h4>
                <p className="text-xs text-gray-600">
                  Após a aprovação, seu perfil receberá o selo de verificação e você terá acesso a todos os benefícios.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">5. Reavaliação Anual</h4>
                <p className="text-xs text-gray-600">
                  Para manter seu status de verificado, realizamos uma reavaliação anual simplificada.
                </p>
              </div>
            </div>
          </ScrollArea>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="font-medium mb-2">Documentos Aceitos</h3>
          <ul className="text-sm text-gray-500 space-y-1 list-disc pl-5">
            <li>RG ou CNH (frente e verso)</li>
            <li>Comprovante de residência recente (últimos 3 meses)</li>
            <li>Selfie com documento de identidade</li>
            <li>Certificações profissionais (opcional, aumenta credibilidade)</li>
            <li>Registro profissional (se aplicável para sua área)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default VerificationBenefits;
