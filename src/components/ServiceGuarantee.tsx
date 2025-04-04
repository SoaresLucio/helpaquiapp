
import React from 'react';
import { Shield, CheckCheck, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const ServiceGuarantee = () => {
  return (
    <Card className="border-green-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-600" />
          HELPAQUI Garantia
        </CardTitle>
        <CardDescription>
          Cobertura para reparos em caso de má execução por até 7 dias.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              <CheckCheck className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium">Satisfação garantida</h3>
              <p className="text-xs text-gray-500">Se o serviço não ficar como esperado, oferecemos cobertura para reparos</p>
            </div>
          </div>
          
          <div className="text-sm border-l-4 border-green-200 pl-3 py-1">
            <span className="font-medium">Período de cobertura:</span> 7 dias após a conclusão do serviço
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-sm">Como funciona a garantia?</AccordionTrigger>
              <AccordionContent className="text-xs text-gray-600">
                <p>A HELPAQUI Garantia oferece cobertura para reparos caso o serviço não atenda às expectativas acordadas. Para acionar a garantia, entre em contato com nosso suporte em até 7 dias após a conclusão do serviço.</p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-sm">O que está coberto?</AccordionTrigger>
              <AccordionContent className="text-xs text-gray-600">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Serviços que não foram concluídos conforme o combinado</li>
                  <li>Falhas técnicas resultantes do serviço prestado</li>
                  <li>Problemas que surgirem dentro do período de garantia devido à má execução</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-sm">O que não está coberto?</AccordionTrigger>
              <AccordionContent className="text-xs text-gray-600">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Danos causados por uso indevido após a prestação do serviço</li>
                  <li>Desgaste natural do serviço ou materiais</li>
                  <li>Problemas não relacionados ao serviço prestado</li>
                  <li>Reclamações feitas após o período de garantia (7 dias)</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <div className="flex items-center gap-2 mt-2 bg-green-50 p-3 rounded-md">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <p className="text-xs text-green-800">
              A HELPAQUI Garantia é automática para todos os serviços contratados pela plataforma.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceGuarantee;
