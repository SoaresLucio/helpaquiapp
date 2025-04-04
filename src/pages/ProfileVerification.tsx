
import React, { useState } from 'react';
import { AlertCircle, BadgeCheck, Upload, ShieldCheck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const ProfileVerification = () => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocuments(Array.from(e.target.files));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate verification process
    setTimeout(() => {
      toast({
        title: "Documentos enviados com sucesso",
        description: "Iniciaremos o processo de verificação em breve.",
      });
      setIsSubmitting(false);
      setDocuments([]);
    }, 2000);
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Verificação de Perfil</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-helpaqui-blue" />
              Perfil Verificado
            </CardTitle>
            <CardDescription>
              Envie seus documentos para obter o selo de verificação e aumentar sua credibilidade.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cpf">CPF ou CNPJ</Label>
                  <Input id="cpf" placeholder="000.000.000-00" required />
                </div>
                
                <div>
                  <Label htmlFor="document-upload">Upload de Documentos</Label>
                  <div className="mt-1 border-2 border-dashed rounded-md p-6 flex flex-col items-center">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 mb-2">Arraste e solte ou clique para selecionar</p>
                    <p className="text-xs text-gray-400 mb-3">RG, CNH, certificações profissionais</p>
                    <Input 
                      id="document-upload" 
                      type="file" 
                      className="sr-only" 
                      onChange={handleFileChange}
                      multiple
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('document-upload')?.click()}
                    >
                      Selecionar arquivos
                    </Button>
                  </div>
                  {documents.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Arquivos selecionados:</p>
                      <ul className="text-sm text-gray-500">
                        {documents.map((file, index) => (
                          <li key={index}>{file.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Importante</AlertTitle>
                  <AlertDescription>
                    Seus documentos serão analisados em até 3 dias úteis. Mantenha seus dados atualizados.
                  </AlertDescription>
                </Alert>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleSubmit} 
              disabled={isSubmitting || documents.length === 0}
            >
              {isSubmitting ? "Enviando..." : "Enviar documentos para verificação"}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Benefícios da Verificação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
            
            <Separator />
            
            <div>
              <h3 className="font-medium mb-2">Documentos Aceitos</h3>
              <ul className="text-sm text-gray-500 space-y-1 list-disc pl-5">
                <li>RG ou CNH (frente e verso)</li>
                <li>CPF ou CNPJ</li>
                <li>Comprovante de residência recente</li>
                <li>Certificações profissionais (se aplicável)</li>
                <li>Registro profissional (se aplicável)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileVerification;
