
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchUserNotes, addNote, updateNote, deleteNote, Note } from '@/services/notesService';
import NotesList from './NotesList';
import NoteDialog from './NoteDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StickyNote, PlusCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const NotesContainer: React.FC = () => {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: notes = [], isLoading, error, refetch } = useQuery({
    queryKey: ['notes'],
    queryFn: fetchUserNotes,
  });

  const handleCreateNote = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setDialogOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content || '');
    setDialogOpen(true);
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta nota?")) return;
    
    try {
      await deleteNote(id);
      toast({
        title: "Nota excluída",
        description: "Sua nota foi excluída com sucesso."
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir nota",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSaveNote = async () => {
    if (!title.trim()) return;
    
    setLoading(true);
    
    try {
      if (editingNote) {
        await updateNote(editingNote.id, title, content);
        toast({
          title: "Nota atualizada",
          description: "Sua nota foi atualizada com sucesso."
        });
      } else {
        await addNote(title, content);
        toast({
          title: "Nota adicionada",
          description: "Sua nota foi salva com sucesso."
        });
      }
      
      setTitle('');
      setContent('');
      setEditingNote(null);
      setDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar nota",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-helpaqui-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-red-600">Erro ao carregar notas. Tente novamente.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <StickyNote className="h-5 w-5 mr-2" />
              Minhas Notas
            </CardTitle>
            <Button onClick={handleCreateNote} className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Nova Nota
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <NotesList 
            notes={notes} 
            onEditNote={handleEditNote}
            onDeleteNote={handleDeleteNote}
            onCreateNote={handleCreateNote}
          />
        </CardContent>
      </Card>

      <NoteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={title}
        content={content}
        setTitle={setTitle}
        setContent={setContent}
        onSave={handleSaveNote}
        loading={loading}
        editingNote={editingNote}
      />
    </div>
  );
};

export default NotesContainer;
