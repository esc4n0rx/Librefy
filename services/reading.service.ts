// services/reading.service.ts

import { ReadingProgress } from '@/types/reader.types';
import { supabase } from './supabase';

export class ReadingService {
  /**
   * Salva ou atualiza o progresso de leitura
   */
  static async saveProgress(
    userId: string,
    bookId: string,
    chapterId: string,
    scrollPosition: number
  ): Promise<void> {
    const { error } = await supabase
      .from('reading_progress')
      .upsert(
        {
          user_id: userId,
          book_id: bookId,
          chapter_id: chapterId,
          scroll_position: scrollPosition,
          last_read_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,book_id',
        }
      );

    if (error) throw error;
  }

  /**
   * Busca o progresso de leitura de um livro
   */
  static async getProgress(userId: string, bookId: string): Promise<ReadingProgress | null> {
    const { data, error } = await supabase
      .from('reading_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /**
   * Atualiza o capítulo atual na biblioteca do usuário
   */
  static async updateCurrentChapter(
    userId: string,
    bookId: string,
    chapterId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('user_library')
      .update({
        current_chapter_id: chapterId,
        last_read_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('book_id', bookId);

    if (error) {
      // Se não está na biblioteca, adicionar
      await supabase.from('user_library').insert({
        user_id: userId,
        book_id: bookId,
        current_chapter_id: chapterId,
        last_read_at: new Date().toISOString(),
      });
    }
  }
}