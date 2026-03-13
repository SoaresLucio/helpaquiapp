import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Category {
  id: string;
  nome: string;
  descricao: string | null;
  icone: string | null;
  cor: string | null;
  ativo: boolean | null;
  order_position: number | null;
}

const emptyForm = { nome: '', descricao: '', icone: '', cor: '#3b82f6', ativo: true };

const AdminCategoriesTab: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('order_position', { ascending: true, nullsFirst: false });
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({
      nome: cat.nome,
      descricao: cat.descricao || '',
      icone: cat.icone || '',
      cor: cat.cor || '#3b82f6',
      ativo: cat.ativo !== false,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.nome.trim()) { toast.error('Nome é obrigatório'); return; }
    setSaving(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from('categorias')
          .update({ nome: form.nome, descricao: form.descricao || null, icone: form.icone || null, cor: form.cor || null, ativo: form.ativo })
          .eq('id', editingId);
        if (error) throw error;
        toast.success('Categoria atualizada');
      } else {
        const { error } = await supabase
          .from('categorias')
          .insert({ nome: form.nome, descricao: form.descricao || null, icone: form.icone || null, cor: form.cor || null, ativo: form.ativo });
        if (error) throw error;
        toast.success('Categoria criada');
      }
      setDialogOpen(false);
      await fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Erro ao salvar categoria');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Excluir a categoria "${nome}"?`)) return;
    try {
      const { error } = await supabase.from('categorias').delete().eq('id', id);
      if (error) throw error;
      toast.success('Categoria excluída');
      await fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Erro ao excluir categoria');
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase.from('categorias').update({ ativo: !current }).eq('id', id);
      if (error) throw error;
      setCategories(prev => prev.map(c => c.id === id ? { ...c, ativo: !current } : c));
      toast.success(`Categoria ${!current ? 'ativada' : 'desativada'}`);
    } catch (error) {
      toast.error('Erro ao atualizar');
    }
  };

  const filtered = categories.filter(c =>
    c.nome.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Categorias</h2>
          <p className="text-muted-foreground">Gerencie as categorias de serviços</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar categorias..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-muted animate-pulse rounded" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Cor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell className="font-medium">{cat.nome}</TableCell>
                      <TableCell className="text-muted-foreground max-w-48 truncate">{cat.descricao || '-'}</TableCell>
                      <TableCell>
                        {cat.cor && <div className="h-5 w-5 rounded-full border" style={{ backgroundColor: cat.cor }} />}
                      </TableCell>
                      <TableCell>
                        <Switch checked={cat.ativo !== false} onCheckedChange={() => toggleActive(cat.id, cat.ativo !== false)} />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => openEdit(cat)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(cat.id, cat.nome)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filtered.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Nenhuma categoria encontrada.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome da categoria" />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Descrição opcional" />
            </div>
            <div className="space-y-2">
              <Label>Ícone (nome)</Label>
              <Input value={form.icone} onChange={(e) => setForm({ ...form, icone: e.target.value })} placeholder="Ex: wrench, hammer" />
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.cor} onChange={(e) => setForm({ ...form, cor: e.target.value })} className="h-9 w-12 rounded border cursor-pointer" />
                <Input value={form.cor} onChange={(e) => setForm({ ...form, cor: e.target.value })} className="flex-1" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.ativo} onCheckedChange={(v) => setForm({ ...form, ativo: v })} />
              <Label>Ativa</Label>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingId ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCategoriesTab;
