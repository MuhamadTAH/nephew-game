import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class DatabaseService implements OnModuleInit {
  constructor(@Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient) {}

  async onModuleInit() {
    try {
      const { data, error } = await this.supabase.from('profiles').select('id').limit(1);
      if (error) {
        console.error('[DatabaseService] Connection test failed:', error.message);
      } else {
        console.log('[DatabaseService] Successfully connected to Supabase');
      }
    } catch (err) {
      console.error('[DatabaseService] Connection test error:', err);
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await this.supabase.from('levels').select('id, letter').limit(1);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}