
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileText, X } from 'lucide-react';

interface JobListing {
  id: string;
  title: string;
  company_name: string;
  company_email: string;
}

interface JobApplicationDialogProps {
  job: JobListing;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const JobApplicationDialog: React.FC<JobApplicationDialogProps> = ({
  job,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    candidate_name: '',
    candidate_email: '',
    candidate_phone: '',
    message: ''
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateFile = (file: File): string | null => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return 'Formato não suportado. Use apenas PDF, DOC ou DOCX.';
    }

    if (file.size > maxSize) {
      return 'Arquivo muito grande. O tamanho máximo é 5MB.';
    }

    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      toast({
        title: "Arquivo inválido",
        description: error,
        variant: "destructive"
      });
      e.target.value = '';
      return;
    }

    setResumeFile(file);
  };

  const removeFile = () => {
    setResumeFile(null);
    const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const uploadResume = async (file: File): Promise<string> => {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(fileName, file);

    if (error) throw error;
    return data.path;
  };

  const sendEmailNotification = async () => {
    try {
      // Aqui você pode implementar o envio de email usando um Edge Function
      // Por enquanto, vamos apenas logar a informação
      console.log('Email notification would be sent to:', job.company_email);
      console.log('Application details:', {
        jobTitle: job.title,
        candidateName: formData.candidate_name,
        candidateEmail: formData.candidate_email
      });
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resumeFile) {
      toast({
        title: "Currículo obrigatório",
        description: "Por favor, anexe seu currículo.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload do currículo
      const resumePath = await uploadResume(resumeFile);

      // Inserir candidatura no banco
      const { error: insertError } = await supabase
        .from('job_applications')
        .insert({
          job_listing_id: job.id,
          candidate_name: formData.candidate_name,
          candidate_email: formData.candidate_email,
          candidate_phone: formData.candidate_phone || null,
          message: formData.message || null,
          resume_url: resumePath
        });

      if (insertError) throw insertError;

      // Enviar notificação por email
      await sendEmailNotification();

      onSuccess();
    } catch (error: any) {
      console.error('Application submission error:', error);
      toast({
        title: "Erro ao enviar candidatura",
        description: error.message || "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Candidatar-se para {job.title}</DialogTitle>
          <p className="text-sm text-gray-600">{job.company_name}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="candidate_name">Nome Completo *</Label>
            <Input
              id="candidate_name"
              name="candidate_name"
              value={formData.candidate_name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="candidate_email">Email *</Label>
            <Input
              id="candidate_email"
              name="candidate_email"
              type="email"
              value={formData.candidate_email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="candidate_phone">Telefone</Label>
            <Input
              id="candidate_phone"
              name="candidate_phone"
              type="tel"
              value={formData.candidate_phone}
              onChange={handleInputChange}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div>
            <Label htmlFor="message">Mensagem (opcional)</Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Conte um pouco sobre sua experiência e interesse na vaga..."
              rows={3}
            />
          </div>

          <div>
            <Label>Currículo *</Label>
            {!resumeFile ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Clique para selecionar seu currículo
                </p>
                <p className="text-xs text-gray-500">
                  PDF, DOC ou DOCX (máx. 5MB)
                </p>
                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">{resumeFile.name}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Candidatura'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JobApplicationDialog;
