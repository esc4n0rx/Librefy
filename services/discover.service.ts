// services/discover.service.ts

import { Book } from '@/types/book.types';
import { supabase } from './supabase';

export interface DiscoverFilters {
  search?: string;
  category_ids?: string[];
  tags?: string[];
  sort?: 'popular' | 'recent' | 'rating' | 'views';
  page?: number;
  limit?: number;
}

export class DiscoverService {
  /**
   * Busca livros públicos com filtros
   */
  static async searchBooks(filters: DiscoverFilters = {}): Promise<{
    books: Book[];
    total: number;
  }> {
    const {
      search,
      category_ids,
      tags,
      sort = 'popular',
      page = 1,
      limit = 20,
    } = filters;

    let query = supabase
      .from('books')
      .select(
        `
        *,
        author:profiles(id, full_name, avatar_url),
        categories:book_category_relations(
          category:book_categories(*)
        ),
        tags:book_tags(tag)
      `,
        { count: 'exact' }
      )
      .eq('status', 'published');


    if (search) {
      query = query.or(`title.ilike.%${search}%,synopsis.ilike.%${search}%`);
    }


    if (category_ids && category_ids.length > 0) {
      const { data: categoryBooks, error: categoryError } = await supabase
        .from('book_category_relations')
        .select('book_id')
        .in('category_id', category_ids);

      if (categoryError) {
        throw categoryError;
      }

      const bookIds = (categoryBooks || []).map((book) => book.book_id);
      query = query.in('id', bookIds);
    }

    if (tags && tags.length > 0) {
      const { data: tagBooks, error: tagError } = await supabase
        .from('book_tags')
        .select('book_id')
        .in('tag', tags);

      if (tagError) {
        throw tagError;
      }

      const bookIds = (tagBooks || []).map((book) => book.book_id);
      query = query.in('id', bookIds);
    }

    // Ordenação
    switch (sort) {
      case 'popular':
        query = query.order('likes_count', { ascending: false });
        break;
      case 'recent':
        query = query.order('published_at', { ascending: false, nullsFirst: false });
        break;
      case 'rating':
        // Nota: Precisaríamos de uma coluna computed ou view para ordenar por rating
        query = query.order('views_count', { ascending: false });
        break;
      case 'views':
        query = query.order('views_count', { ascending: false });
        break;
    }

    // Paginação
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    // Transformar os dados
    const books = (data || []).map((book) => ({
      ...book,
      categories: book.categories?.map((rel: any) => rel.category) || [],
      tags: book.tags?.map((t: any) => t.tag) || [],
    }));

    return {
      books,
      total: count || 0,
    };
  }

  /**
   * Busca um livro público por ID com detalhes completos
   */
  static async getBookDetails(bookId: string): Promise<Book> {
    const { data, error } = await supabase
      .from('books')
      .select(
        `
        *,
        author:profiles(id, full_name, avatar_url),
        categories:book_category_relations(
          category:book_categories(*)
        ),
        tags:book_tags(tag)
      `
      )
      .eq('id', bookId)
      .eq('status', 'published')
      .single();

    if (error) throw error;

    return {
      ...data,
      categories: data.categories?.map((rel: any) => rel.category) || [],
      tags: data.tags?.map((t: any) => t.tag) || [],
    };
  }

  /**
   * Incrementa o contador de visualizações de um livro
   */
  static async incrementBookViews(bookId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_book_views', {
      book_id: bookId,
    });

    if (error) {
      // Se a função RPC não existir, fazer update manual
      const { data: book } = await supabase
        .from('books')
        .select('views_count')
        .eq('id', bookId)
        .single();

      if (book) {
        await supabase
          .from('books')
          .update({ views_count: (book.views_count || 0) + 1 })
          .eq('id', bookId);
      }
    }
  }
}