// services/content.service.ts

import { BookContent, ContentType } from '@/types/editor.types';
import { supabase } from './supabase';

export class ContentService {
  /**
   * Busca todos os conteúdos especiais de um livro
   */
  static async getBookContents(bookId: string): Promise<BookContent[]> {
    const { data, error } = await supabase
      .from('book_contents')
      .select('*')
      .eq('book_id', bookId)
      .order('position');

    if (error) throw error;
    return data || [];
  }

  /**
   * Busca um conteúdo específico
   */
  static async getContent(contentId: string): Promise<BookContent> {
    const { data, error } = await supabase
      .from('book_contents')
      .select('*')
      .eq('id', contentId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Cria ou atualiza um conteúdo especial
   */
  static async upsertContent(
    bookId: string,
    contentType: ContentType,
    content: Partial<BookContent>
  ): Promise<BookContent> {
    const { data, error } = await supabase
      .from('book_contents')
      .upsert(
        {
          book_id: bookId,
          content_type: contentType,
          ...content,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'book_id,content_type',
        }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Deleta um conteúdo
   */
  static async deleteContent(contentId: string): Promise<void> {
    const { error } = await supabase
      .from('book_contents')
      .delete()
      .eq('id', contentId);

    if (error) throw error;
  }

  /**
   * Atualiza o conteúdo de um capítulo
   */
  static async updateChapterContent(
    chapterId: string,
    content: string
  ): Promise<void> {
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

    const { error } = await supabase
      .from('book_chapters')
      .update({
        content,
        word_count: wordCount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', chapterId);

    if (error) throw error;
  }
}