// services/home.service.ts

import { Book, BookCategory } from '@/types/book.types';
import { supabase } from './supabase';

export interface TrendingAuthor {
  id: string;
  full_name: string;
  avatar_url?: string;
  total_books: number;
  total_views: number;
  total_likes: number;
}

export class HomeService {
  /**
   * Busca todas as categorias
   */
  static async getCategories(): Promise<BookCategory[]> {
    const { data, error } = await supabase
      .from('book_categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  /**
   * Busca livros recentemente publicados (últimos 30 dias)
   */
  static async getRecentBooks(limit: number = 10): Promise<Book[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .from('books')
      .select(
        `
        *,
        author:profiles(id, full_name, avatar_url),
        categories:book_category_relations(
          category:book_categories(*)
        )
      `
      )
      .eq('status', 'published')
      .gte('published_at', thirtyDaysAgo.toISOString())
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map((book) => ({
      ...book,
      categories: book.categories?.map((rel: any) => rel.category) || [],
      tags: [],
    }));
  }

  /**
   * Busca livros em alta (ordenados por views e likes)
   */
  static async getTrendingBooks(limit: number = 10): Promise<Book[]> {
    const { data, error } = await supabase
      .from('books')
      .select(
        `
        *,
        author:profiles(id, full_name, avatar_url),
        categories:book_category_relations(
          category:book_categories(*)
        )
      `
      )
      .eq('status', 'published')
      .order('views_count', { ascending: false })
      .order('likes_count', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map((book) => ({
      ...book,
      categories: book.categories?.map((rel: any) => rel.category) || [],
      tags: [],
    }));
  }

  /**
   * Busca autores em alta (ordenados por views e likes dos livros)
   */
  static async getTrendingAuthors(limit: number = 10): Promise<TrendingAuthor[]> {
    // Buscar livros publicados com author info
    const { data: books, error: booksError } = await supabase
      .from('books')
      .select('author_id, title, views_count, likes_count')
      .eq('status', 'published')
      .order('views_count', { ascending: false });

    if (booksError) throw booksError;
    if (!books || books.length === 0) return [];

    const authorStatsMap = new Map<
    string,
        { total_books: number; total_views: number; total_likes: number }
    >();

    books.forEach((book) => {
      const current = authorStatsMap.get(book.author_id) || {
        total_books: 0,
        total_views: 0,
        total_likes: 0,
      };

      authorStatsMap.set(book.author_id, {
        total_books: current.total_books + 1,
        total_views: current.total_views + (book.views_count || 0),
        total_likes: current.total_likes + (book.likes_count || 0),
      });
    });

    // Ordenar por views e pegar top autores
    const topAuthorIds = Array.from(authorStatsMap.entries())
      .sort((a, b) => b[1].total_views - a[1].total_views)
      .slice(0, limit)
      .map(([authorId]) => authorId);

    if (topAuthorIds.length === 0) return [];

    // Buscar info dos autores
    const { data: authors, error: authorsError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', topAuthorIds);

    if (authorsError) throw authorsError;

    // Combinar dados
    return (authors || []).map((author) => {
      const stats = authorStatsMap.get(author.id) || {
        total_books: 0,
        total_views: 0,
        total_likes: 0,
      };
      return {
        ...author,
        ...stats,
      };
    });
  }

  /**
   * Busca livros recomendados baseados na biblioteca do usuário
   */
  static async getRecommendedBooks(userId: string, limit: number = 10): Promise<Book[]> {
    // 1. Buscar categorias dos livros na biblioteca do usuário
    const { data: userLibrary, error: libraryError } = await supabase
      .from('user_library')
      .select(
        `
        book:books(
          categories:book_category_relations(category_id)
        )
      `
      )
      .eq('user_id', userId);

    if (libraryError) throw libraryError;

    // Extrair IDs de categorias únicas
    const categoryIds = new Set<string>();
    userLibrary?.forEach((item: any) => {
      item.book?.categories?.forEach((cat: any) => {
        if (cat.category_id) categoryIds.add(cat.category_id);
      });
    });

    if (categoryIds.size === 0) {
      return this.getTrendingBooks(limit);
    }

    // 2. Buscar livros com essas categorias que o usuário ainda não tem
    const { data: userBookIds } = await supabase
      .from('user_library')
      .select('book_id')
      .eq('user_id', userId);

    const excludeBookIds = (userBookIds || []).map((item) => item.book_id);

    const { data: categoryBooks, error: categoryError } = await supabase
      .from('book_category_relations')
      .select('book_id')
      .in('category_id', Array.from(categoryIds));

    if (categoryError) throw categoryError;

    const recommendedBookIds = (categoryBooks || [])
      .map((item) => item.book_id)
      .filter((id) => !excludeBookIds.includes(id));

    if (recommendedBookIds.length === 0) {
      return this.getTrendingBooks(limit);
    }

    // 3. Buscar detalhes dos livros recomendados
    const { data, error } = await supabase
      .from('books')
      .select(
        `
        *,
        author:profiles(id, full_name, avatar_url),
        categories:book_category_relations(
          category:book_categories(*)
        )
      `
      )
      .eq('status', 'published')
      .in('id', recommendedBookIds.slice(0, limit * 2))
      .order('views_count', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map((book) => ({
      ...book,
      categories: book.categories?.map((rel: any) => rel.category) || [],
      tags: [],
    }));
  }
}