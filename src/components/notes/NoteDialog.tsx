
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';

interface Note {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
}

interface NoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string;
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  onSave: () => void;
  loading: boolean;
  editingNote: Note | null;
}

const NoteDialog: React.FC<NoteDialogProps> = ({
  open,
  onOpenChange,
  title,
  content,
  setTitle,
  setContent,
  onSave,
  loading,
  editingNote
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingNote ? 'Editar Nota' : 'Nova Nota'}
          </DialogTitle>
          <DialogDescription>
            {editingNote ? 'Atualize sua nota abaixo' : 'Crie sua nova nota abaixo'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              placeholder="Título da nota"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="Conteúdo da nota"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            onClick={onSave}
            disabled={loading || !title.trim()}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {loading ? "Salvando..." : "Salvar Nota"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NoteDialog;
