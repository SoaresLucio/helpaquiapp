
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PlusCircle, LogOut } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from "@/integrations/supabase/client";
import Header from '@/components/Header';
import BackButton from '@/components/ui/back-button';
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

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate('/login');
      else { setUser(session.user); loadNotes(); }
    };
    checkAuth();
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => { if (!session) navigate('/login'); });
    return () => { authListener.subscription.unsubscribe(); };
  }, [navigate]);

  const loadNotes = async () => {
    try { setNotes(await fetchUserNotes()); }
    catch (error: any) { toast({ title: "Erro ao buscar notas", description: error.message, variant: "destructive" }); }
  };

  const handleAddNote = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try { await addNote(title, content); toast({ title: "Nota adicionada" }); setTitle(''); setContent(''); loadNotes(); setDialogOpen(false); }
    catch (error: any) { toast({ title: "Erro", description: error.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const handleUpdateNote = async () => {
    if (!editingNote || !title.trim()) return;
    setLoading(true);
    try { await updateNote(editingNote.id, title, content); toast({ title: "Nota atualizada" }); setEditingNote(null); setTitle(''); setContent(''); loadNotes(); setDialogOpen(false); }
    catch (error: any) { toast({ title: "Erro", description: error.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm("Excluir esta nota?")) return;
    try { await deleteNote(id); toast({ title: "Nota excluída" }); loadNotes(); }
    catch (error: any) { toast({ title: "Erro", description: error.message, variant: "destructive" }); }
  };

  const handleEdit = (note: Note) => { setEditingNote(note); setTitle(note.title); setContent(note.content || ''); setDialogOpen(true); };
  const handleNewNote = () => { setEditingNote(null); setTitle(''); setContent(''); setDialogOpen(true); };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="container mx-auto py-6 px-4">
        <div className="mb-6"><BackButton to="/dashboard" label="Voltar ao Início" /></div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">Minhas Notas</h1>
          <Button onClick={handleNewNote} className="gradient-primary text-white border-0 rounded-xl shadow-lg shadow-primary/25">
            <PlusCircle className="h-4 w-4 mr-2" />Nova Nota
          </Button>
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <NotesList notes={notes} onEditNote={handleEdit} onDeleteNote={handleDeleteNote} onCreateNote={handleNewNote} />
        </motion.div>
        <NoteDialog open={dialogOpen} onOpenChange={setDialogOpen} title={title} content={content} setTitle={setTitle} setContent={setContent} onSave={editingNote ? handleUpdateNote : handleAddNote} loading={loading} editingNote={editingNote} />
      </motion.div>
    </div>
  );
};

export default Notes;
