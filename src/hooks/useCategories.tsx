
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Category {
  id: string;
  nome: string;
  descricao?: string;
  icone?: string;
  cor?: string;
  ativo: boolean;
  order_position?: number;
  created_at: string;
  created_by?: string;
  updated_by?: string;
}

export const useCategories = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const loadCategories = useCallback(async (includeInactive = false) => {
    setLoading(true);
    try {
      let query = supabase
        .from('categorias')
        .select('*')
        .order('order_position', { ascending: true });

      if (!includeInactive) {
        query = query.eq('ativo', true);
      }

      const { data, error } = await query;

      if (error) throw error;

      setCategories(data || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar categorias",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createCategory = useCallback(async (categoryData: Omit<Category, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .insert(categoryData)
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => [...prev, data]);
      toast({
        title: "Sucesso",
        description: "Categoria criada com sucesso",
      });

      return data;
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar categoria",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  const updateCategory = useCallback(async (id: string, updates: Partial<Category>) => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => 
        prev.map(cat => cat.id === id ? { ...cat, ...data } : cat)
      );

      toast({
        title: "Sucesso",
        description: "Categoria atualizada com sucesso",
      });

      return data;
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar categoria",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCategories(prev => prev.filter(cat => cat.id !== id));
      toast({
        title: "Sucesso",
        description: "Categoria excluída com sucesso",
      });
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir categoria",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    loading,
    categories,
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
