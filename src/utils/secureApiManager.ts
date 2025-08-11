import { supabase } from '@/integrations/supabase/client';

class SecureApiManager {
  private static instance: SecureApiManager;
  private apiKeys: Map<string, string> = new Map();

  private constructor() {}

  static getInstance(): SecureApiManager {
    if (!SecureApiManager.instance) {
      SecureApiManager.instance = new SecureApiManager();
    }
    return SecureApiManager.instance;
  }

  async getApiKey(name: string): Promise<string | null> {
    // Check cache first
    if (this.apiKeys.has(name)) {
      return this.apiKeys.get(name)!;
    }

    try {
      const { data, error } = await supabase.functions.invoke('get-secret', {
        body: { name }
      });

      if (error) {
        console.error(`Error fetching API key ${name}:`, error);
        return null;
      }

      if (data?.value) {
        // Cache the key for this session
        this.apiKeys.set(name, data.value);
        return data.value;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching API key ${name}:`, error);
      return null;
    }
  }

  clearCache(): void {
    this.apiKeys.clear();
  }

  // Secure method to validate API key format
  validateApiKeyFormat(key: string, type: 'openai' | 'google' | 'stripe'): boolean {
    switch (type) {
      case 'openai':
        return key.startsWith('sk-') && key.length > 40;
      case 'google':
        return key.length > 30 && !key.includes(' ');
      case 'stripe':
        return (key.startsWith('sk_') || key.startsWith('pk_')) && key.length > 20;
      default:
        return key.length > 10;
    }
  }
}

export const secureApiManager = SecureApiManager.getInstance();