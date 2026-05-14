import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Send, Paperclip, Smile, Calendar, Image as ImageIcon, FileText, ShieldAlert, DollarSign, Loader2,
} from 'lucide-react';
import { filterChatMessage } from '@/utils/chatContentFilter';
import { useToast } from '@/components/ui/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ChatInputProps {
  onSendMessage: (content: string, type?: 'text' | 'file' | 'schedule_suggestion', additionalData?: any) => boolean;
  onOpenBudgetProposal?: () => void;
  userType: string | null;
  conversation: any;
}

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = /^(image\/(png|jpe?g|webp|gif)|application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.|text\/plain)/i;

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onOpenBudgetProposal, userType }) => {
  const [message, setMessage] = useState('');
  const [showQuickMessages, setShowQuickMessages] = useState(false);
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [blockWarning, setBlockWarning] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileImageRef = useRef<HTMLInputElement>(null);
  const fileDocRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const quickMessages = {
    freelancer: [
      'Olá, tudo bem? Recebi sua solicitação.',
      'Pode me confirmar o horário e local, por favor?',
      'Serviço concluído. Pode confirmar no app?',
      'Estou a caminho do local combinado.',
    ],
    solicitante: [
      'Olá! Obrigado por aceitar meu pedido.',
      'O horário está confirmado.',
      'Aguardo você no local combinado.',
      'Ficou excelente! Muito obrigado.',
    ],
  };
  const currentQuick = userType === 'freelancer' ? quickMessages.freelancer : quickMessages.solicitante;

  const trySend = (text: string) => {
    const filterResult = filterChatMessage(text);
    if (filterResult.isBlocked) {
      setBlockWarning(filterResult.reason || 'Mensagem bloqueada');
      toast({ title: '⚠️ Mensagem bloqueada', description: filterResult.reason, variant: 'destructive' });
      setTimeout(() => setBlockWarning(null), 5000);
      return false;
    }
    setBlockWarning(null);
    return onSendMessage(text);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const text = message.trim();
    if (!text) return;
    if (trySend(text)) setMessage('');
  };

  const handleQuickMessage = (q: string) => {
    if (trySend(q)) setShowQuickMessages(false);
  };

  const handleScheduleSuggestion = () => {
    if (!scheduleDate || !scheduleTime) {
      toast({ title: 'Selecione data e horário', variant: 'destructive' });
      return;
    }
    const scheduleMessage = `Que tal nos encontrarmos no dia ${new Date(scheduleDate).toLocaleDateString('pt-BR')} às ${scheduleTime}?`;
    const ok = onSendMessage('', 'schedule_suggestion', {
      scheduleData: { date: scheduleDate, time: scheduleTime, message: scheduleMessage },
    });
    if (ok) {
      setShowSchedulePicker(false);
      setScheduleDate('');
      setScheduleTime('');
    }
  };

  const handleFilePicked = async (file: File, kind: 'image' | 'document') => {
    if (!user) { toast({ title: 'Faça login', variant: 'destructive' }); return; }
    if (file.size > MAX_FILE_BYTES) {
      toast({ title: 'Arquivo muito grande', description: 'Limite: 10 MB.', variant: 'destructive' });
      return;
    }
    if (!ALLOWED_TYPES.test(file.type)) {
      toast({ title: 'Tipo não permitido', description: 'Envie imagens (PNG/JPG/WEBP/GIF), PDF, DOC/DOCX ou TXT.', variant: 'destructive' });
      return;
    }
    setUploading(true);
    try {
      const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage.from('chat-attachments').upload(path, file, {
        contentType: file.type, upsert: false,
      });
      if (upErr) throw upErr;
      // Bucket is private — generate a long-lived signed URL (1 year).
      const { data: signed, error: signErr } = await supabase
        .storage.from('chat-attachments')
        .createSignedUrl(path, 60 * 60 * 24 * 365);
      if (signErr) throw signErr;
      onSendMessage('', 'file', {
        fileData: {
          name: file.name,
          size: formatBytes(file.size),
          type: kind,
          mime: file.type,
          url: signed.signedUrl,
          path,
        },
      });
    } catch (err: any) {
      toast({ title: 'Falha no envio do arquivo', description: err?.message || 'Tente novamente', variant: 'destructive' });
    } finally {
      setUploading(false);
      if (fileImageRef.current) fileImageRef.current.value = '';
      if (fileDocRef.current) fileDocRef.current.value = '';
    }
  };

  return (
    <div className="p-3 border-t bg-background">
      {blockWarning && (
        <div className="mb-3 p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-destructive shrink-0" />
          <span className="text-sm text-destructive">{blockWarning}</span>
        </div>
      )}

      {showQuickMessages && (
        <div className="mb-3 p-3 bg-muted rounded-lg">
          <span className="text-xs font-medium text-muted-foreground">Mensagens rápidas:</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {currentQuick.map((q, i) => (
              <Badge key={i} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleQuickMessage(q)}>
                {q}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {showSchedulePicker && (
        <div className="mb-3 p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Sugerir horário</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input type="date" className="text-sm" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
            <Input type="time" className="text-sm" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
          </div>
          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={handleScheduleSuggestion}>Enviar sugestão</Button>
            <Button size="sm" variant="outline" onClick={() => setShowSchedulePicker(false)}>Cancelar</Button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-end gap-2">
        <div className="flex-1">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="min-h-[44px] max-h-[120px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e as any);
              }
            }}
          />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" size="sm" disabled={uploading}>
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2">
                <div className="space-y-1">
                  <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => fileImageRef.current?.click()}>
                    <ImageIcon className="h-4 w-4 mr-2" /> Enviar foto
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => fileDocRef.current?.click()}>
                    <FileText className="h-4 w-4 mr-2" /> Enviar documento
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <input ref={fileImageRef} type="file" accept="image/*" hidden
              onChange={(e) => e.target.files?.[0] && handleFilePicked(e.target.files[0], 'image')} />
            <input ref={fileDocRef} type="file" accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" hidden
              onChange={(e) => e.target.files?.[0] && handleFilePicked(e.target.files[0], 'document')} />

            <Button type="button" variant="outline" size="sm" onClick={() => setShowSchedulePicker(v => !v)}>
              <Calendar className="h-4 w-4" />
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowQuickMessages(v => !v)}>
              <Smile className="h-4 w-4" />
            </Button>
            {onOpenBudgetProposal && (
              <Button type="button" variant="outline" size="sm" title="Enviar proposta de orçamento" onClick={onOpenBudgetProposal}>
                <DollarSign className="h-4 w-4" />
              </Button>
            )}
          </div>

          <Button type="submit" disabled={!message.trim()} className="bg-primary hover:bg-primary/90">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
