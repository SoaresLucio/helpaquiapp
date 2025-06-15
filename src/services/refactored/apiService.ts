
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type TableName = keyof Database['public']['Tables'];
type TableRow<T extends TableName> = Database['public']['Tables'][T]['Row'];
type TableInsert<T extends TableName> = Database['public']['Tables'][T]['Insert'];
type TableUpdate<T extends TableName> = Database['public']['Tables'][T]['Update'];

export class ApiService {
  /**
   * Generic error handler for API requests
   */
  static async handleRequest<T>(
    requestFn: () => Promise<{ data: T | null; error: any }>
  ): Promise<{ data: T | null; error: any }> {
    try {
      const result = await requestFn();
      
      if (result.error) {
        console.error('API Error:', result.error);
        return { data: null, error: result.error };
      }
      
      return { data: result.data, error: null };
    } catch (error) {
      console.error('Unexpected error:', error);
      return { data: null, error };
    }
  }

  /**
   * Get records from a table with optional filtering
   */
  static async get<T extends TableName>(
    table: T, 
    filters?: Record<string, any>
  ): Promise<{ data: TableRow<T>[] | null; error: any }> {
    return this.handleRequest(async () => {
      let query = supabase.from(table as any).select('*');
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      const result = await query;
      return { data: result.data as TableRow<T>[] | null, error: result.error };
    });
  }

  /**
   * Get a single record by ID
   */
  static async getById<T extends TableName>(
    table: T, 
    id: string
  ): Promise<{ data: TableRow<T> | null; error: any }> {
    return this.handleRequest(async () => {
      const result = await supabase
        .from(table as any)
        .select('*')
        .eq('id', id)
        .single();
      
      return { data: result.data as TableRow<T> | null, error: result.error };
    });
  }

  /**
   * Create a new record
   */
  static async create<T extends TableName>(
    table: T, 
    data: TableInsert<T>
  ): Promise<{ data: TableRow<T> | null; error: any }> {
    return this.handleRequest(async () => {
      const result = await supabase
        .from(table as any)
        .insert(data as any)
        .select()
        .single();
      
      return { data: result.data as TableRow<T> | null, error: result.error };
    });
  }

  /**
   * Update a record by ID
   */
  static async update<T extends TableName>(
    table: T, 
    id: string, 
    data: TableUpdate<T>
  ): Promise<{ data: TableRow<T> | null; error: any }> {
    return this.handleRequest(async () => {
      const result = await supabase
        .from(table as any)
        .update(data as any)
        .eq('id', id)
        .select()
        .single();
      
      return { data: result.data as TableRow<T> | null, error: result.error };
    });
  }

  /**
   * Delete a record by ID
   */
  static async delete<T extends TableName>(
    table: T, 
    id: string
  ): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from(table as any)
        .delete()
        .eq('id', id);
      
      return { error };
    } catch (error) {
      console.error('Delete error:', error);
      return { error };
    }
  }

  /**
   * Count records in a table with optional filtering
   */
  static async count<T extends TableName>(
    table: T, 
    filters?: Record<string, any>
  ): Promise<{ data: number | null; error: any }> {
    return this.handleRequest(async () => {
      let query = supabase.from(table as any).select('*', { count: 'exact', head: true });
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      const result = await query;
      return { data: result.count, error: result.error };
    });
  }
}
