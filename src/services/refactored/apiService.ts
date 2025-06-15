
import { supabase } from '@/integrations/supabase/client';

export class ApiService {
  static async handleRequest<T>(
    requestFn: () => Promise<{ data: T; error: any }>
  ): Promise<{ data: T | null; error: any }> {
    try {
      const { data, error } = await requestFn();
      
      if (error) {
        console.error('API Error:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected error:', error);
      return { data: null, error };
    }
  }

  static async get<T>(table: string, query?: any): Promise<{ data: T | null; error: any }> {
    return this.handleRequest(() => {
      let queryBuilder = supabase.from(table).select('*');
      
      if (query) {
        Object.entries(query).forEach(([key, value]) => {
          queryBuilder = queryBuilder.eq(key, value);
        });
      }
      
      return queryBuilder;
    });
  }

  static async create<T>(table: string, data: any): Promise<{ data: T | null; error: any }> {
    return this.handleRequest(() => 
      supabase.from(table).insert(data).select().single()
    );
  }

  static async update<T>(
    table: string, 
    id: string, 
    data: any
  ): Promise<{ data: T | null; error: any }> {
    return this.handleRequest(() => 
      supabase.from(table).update(data).eq('id', id).select().single()
    );
  }

  static async delete(table: string, id: string): Promise<{ error: any }> {
    const { error } = await supabase.from(table).delete().eq('id', id);
    return { error };
  }
}
