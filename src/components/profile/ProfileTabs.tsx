
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ProfileTabs: React.FC = () => {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="profile">Perfil</TabsTrigger>
        <TabsTrigger value="bank">Dados Bancários</TabsTrigger>
        <TabsTrigger value="income">Rendimentos</TabsTrigger>
        <TabsTrigger value="settings">Configurações</TabsTrigger>
      </TabsList>
      
      <TabsContent value="profile" className="mt-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Informações do perfil são exibidas acima.</p>
        </div>
      </TabsContent>
      
      <TabsContent value="bank">
        <div className="text-center py-8">
          <p className="text-gray-500">Configurações bancárias serão implementadas aqui.</p>
        </div>
      </TabsContent>
      
      <TabsContent value="income">
        <div className="text-center py-8">
          <p className="text-gray-500">Relatório de rendimentos será implementado aqui.</p>
        </div>
      </TabsContent>
      
      <TabsContent value="settings">
        <div className="text-center py-8">
          <p className="text-gray-500">Configurações adicionais serão implementadas aqui.</p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
