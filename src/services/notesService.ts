
import { supabase } from "@/integrations/supabase/client";

export interface Note {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
}

export const fetchUserNotes = async () => {
  // Use type assertion to work around TypeScript issues
  const { data, error } = await (supabase
    .from('notes') as any)
    .select('*')
    .order('updated_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const addNote = async (title: string, content: string, userId: string) => {
  const { data, error } = await (supabase
    .from('notes') as any)
    .insert([
      { title, content, user_id: userId }
    ])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateNote = async (id: string, title: string, content: string) => {
  const { data, error } = await (supabase
    .from('notes') as any)
    .update({ title, content, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteNote = async (id: string) => {
  const { error } = await (supabase
    .from('notes') as any)
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};
