
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2, LogOut, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Note {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
}

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
        fetchNotes();
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
  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      setNotes(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao buscar notas",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Adicionar uma nova nota
  const addNote = async () => {
    if (!title.trim()) return;
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([
          { title, content, user_id: user.id }
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Nota adicionada",
        description: "Sua nota foi salva com sucesso."
      });
      
      setTitle('');
      setContent('');
      fetchNotes();
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
  const updateNote = async () => {
    if (!editingNote || !title.trim()) return;
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('notes')
        .update({ title, content, updated_at: new Date().toISOString() })
        .eq('id', editingNote.id)
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Nota atualizada",
        description: "Sua nota foi atualizada com sucesso."
      });
      
      setEditingNote(null);
      setTitle('');
      setContent('');
      fetchNotes();
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
  const deleteNote = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta nota?")) return;
    
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Nota excluída",
        description: "Sua nota foi excluída com sucesso."
      });
      
      fetchNotes();
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

      {notes.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-8 text-center">
            <p className="text-gray-500 mb-4">Você ainda não tem nenhuma nota.</p>
            <Button onClick={handleNewNote}>Criar minha primeira nota</Button>
          </CardContent>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50%]">Título</TableHead>
              <TableHead>Data de Modificação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notes.map(note => (
              <TableRow key={note.id}>
                <TableCell className="font-medium">{note.title}</TableCell>
                <TableCell>
                  {new Date(note.updated_at).toLocaleDateString('pt-BR')} às{' '}
                  {new Date(note.updated_at).toLocaleTimeString('pt-BR')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleEdit(note)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="text-red-500 hover:text-red-700" 
                      onClick={() => deleteNote(note.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
              onClick={() => setDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={editingNote ? updateNote : addNote}
              disabled={loading || !title.trim()}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {loading ? "Salvando..." : "Salvar Nota"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Notes;
