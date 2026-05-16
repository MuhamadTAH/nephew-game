import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class AuthService {
  constructor(@Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient) {}

  async register(): Promise<{ id: number }> {
    const { data: profiles, error: fetchError } = await this.supabase
      .from('profiles')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);

    if (fetchError) {
      throw new Error('Failed to fetch profiles');
    }

    const nextId = profiles.length > 0 ? profiles[0].id + 1 : 1;

    const { data, error } = await this.supabase
      .from('profiles')
      .insert([{ id: nextId, current_level: 1 }])
      .select()
      .single();

    if (error) {
      throw new Error('Failed to create profile');
    }

    return { id: data.id };
  }

  async login(id: number): Promise<{ success: boolean; profile?: any }> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return { success: false };
    }

    return { success: true, profile: data };
  }

  async getProfileById(id: number) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error('Profile not found');
    }

    return data;
  }
}