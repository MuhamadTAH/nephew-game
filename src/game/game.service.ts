import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class GameService {
  constructor(@Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient) {}

  async submitAnswer(
    profileId: number,
    levelId: number,
    selectedOption: string,
  ) {
    const levelResponse = await this.supabase
      .from('levels')
      .select('letter')
      .eq('id', levelId)
      .single();

    if (!levelResponse.data) {
      return { correct: false, error: 'Level not found' };
    }

    const correctLetter = levelResponse.data.letter;
    const isCorrect = selectedOption.toUpperCase() === correctLetter.toUpperCase();

    if (isCorrect) {
      const { error: updateError } = await this.supabase
        .from('profiles')
        .update({ current_level: levelId + 1 })
        .eq('id', profileId);

      if (updateError) {
        return { correct: true, advance: false, error: 'Failed to update progress' };
      }

      return { correct: true, advance: true, nextLevel: levelId + 1 };
    }

    return { correct: false, advance: false };
  }
}