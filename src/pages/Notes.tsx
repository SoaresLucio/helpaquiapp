
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle, LogOut } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from "@/integrations/supabase/client";
import NoteDialog from '@/components/notes/NoteDialog';
import NotesList from '@/components/notes/NotesList';
import { Note, fetchUserNotes, addNote, updateNote, deleteNote } from '@/services/notesService';

const Notes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Verificar autenticação
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
        loadNotes();
      }
    };
    
    checkAuth();

    // Monitorar mudanças na autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/auth');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  // Buscar notas do usuário
  const loadNotes = async () => {
    try {
      const data = await fetchUserNotes();
      setNotes(data);
    } catch (error: any) {
      toast({
        title: "Erro ao buscar notas",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Adicionar uma nova nota
  const handleAddNote = async () => {
    if (!title.trim()) return;
    
    setLoading(true);
    
    try {
      await addNote(title, content, user.id);
      
      toast({
        title: "Nota adicionada",
        description: "Sua nota foi salva com sucesso."
      });
      
      setTitle('');
      setContent('');
      loadNotes();
      setDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar nota",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Atualizar uma nota existente
  const handleUpdateNote = async () => {
    if (!editingNote || !title.trim()) return;
    
    setLoading(true);
    
    try {
      await updateNote(editingNote.id, title, content);
      
      toast({
        title: "Nota atualizada",
        description: "Sua nota foi atualizada com sucesso."
      });
      
      setEditingNote(null);
      setTitle('');
      setContent('');
      loadNotes();
      setDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar nota",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Excluir uma nota
  const handleDeleteNote = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta nota?")) return;
    
    try {
      await deleteNote(id);
      
      toast({
        title: "Nota excluída",
        description: "Sua nota foi excluída com sucesso."
      });
      
      loadNotes();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir nota",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Função para editar uma nota existente
  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content || '');
    setDialogOpen(true);
  };

  // Função para nova nota
  const handleNewNote = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setDialogOpen(true);
  };

  // Função para fazer logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Minhas Notas</h1>
        <div className="flex gap-2">
          <Button onClick={handleNewNote} className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Nova Nota
          </Button>
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>

      <NotesList 
        notes={notes} 
        onEditNote={handleEdit} 
        onDeleteNote={handleDeleteNote}
        onCreateNote={handleNewNote}
      />

      <NoteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={title}
        content={content}
        setTitle={setTitle}
        setContent={setContent}
        onSave={editingNote ? handleUpdateNote : handleAddNote}
        loading={loading}
        editingNote={editingNote}
      />
    </div>
  );
};

export default Notes;
