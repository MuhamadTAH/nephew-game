import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class LevelsService {
  constructor(@Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient) {}

  async getLevel(levelId: number) {
    const { data, error } = await this.supabase
      .from('levels')
      .select('*')
      .eq('id', levelId)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      throw new Error('Level not found');
    }

    return {
      id: data.id,
      letter: data.letter,
      options: data.options,
      positionIndex: data.position_index,
    };
  }

  async getAllLevels() {
    const { data, error } = await this.supabase
      .from('levels')
      .select('id, letter, is_active')
      .eq('is_active', true)
      .order('id', { ascending: true });

    if (error) {
      throw new Error('Failed to fetch levels');
    }

    return data;
  }
}