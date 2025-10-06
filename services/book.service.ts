// services/book.service.ts

import {
  Book,
  BookCategory,
  BookChapter,
  CreateBookData,
  CreateChapterData,
  UpdateBookData,
  UserLibraryItem,
} from '@/types/book.types';
import { supabase } from './supabase';
import { UploadService } from './upload.service';

export class BookService {
  // Exportar supabase para uso direto em casos específicos
  static supabase = supabase;

  /**
   * Busca todas as categorias disponíveis
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
   * Cria um novo livro
   */
  static async createBook(userId: string, bookData: CreateBookData): Promise<Book> {
    let folderName: string | undefined;
    let coverFilename: string | undefined;
    let bannerFilename: string | undefined;

    try {
      // 1. Gerar nome da pasta
      folderName = UploadService.generateFolderName(bookData.title);

      // 2. Criar pasta na API
      await UploadService.createFolder(folderName);

      // 3. Upload de imagens (se fornecidas)
      const filesToUpload: { uri: string; name: string; type: string }[] = [];

      if (bookData.cover_file) {
        filesToUpload.push(bookData.cover_file);
      }

      if (bookData.banner_file) {
        filesToUpload.push(bookData.banner_file);
      }

      if (filesToUpload.length > 0) {
        const uploadedFiles = await UploadService.uploadFiles(folderName, filesToUpload);

        if (bookData.cover_file && uploadedFiles[0]) {
          coverFilename = uploadedFiles[0];
        }

        if (bookData.banner_file && uploadedFiles[bookData.cover_file ? 1 : 0]) {
          bannerFilename = uploadedFiles[bookData.cover_file ? 1 : 0];
        }
      }

      // 4. Criar registro do livro no banco
      const { data: book, error: bookError } = await supabase
        .from('books')
        .insert({
          author_id: userId,
          title: bookData.title,
          synopsis: bookData.synopsis,
          age_rating: bookData.age_rating,
          folder_name: folderName,
          cover_url: coverFilename ? UploadService.getFileUrl(folderName, coverFilename) : null,
          banner_url: bannerFilename
            ? UploadService.getFileUrl(folderName, bannerFilename)
            : null,
          status: 'draft',
        })
        .select()
        .single();

      if (bookError) throw bookError;

      // 5. Criar relações com categorias
      if (bookData.category_ids.length > 0) {
        const categoryRelations = bookData.category_ids.map((categoryId) => ({
          book_id: book.id,
          category_id: categoryId,
        }));

        const { error: categoryError } = await supabase
          .from('book_category_relations')
          .insert(categoryRelations);

        if (categoryError) throw categoryError;
      }

      // 6. Criar tags
      if (bookData.tags.length > 0) {
        const tagInserts = bookData.tags.map((tag) => ({
          book_id: book.id,
          tag: tag.toLowerCase().trim(),
        }));

        const { error: tagError } = await supabase.from('book_tags').insert(tagInserts);

        if (tagError) throw tagError;
      }

      return book;
    } catch (error) {
      // Rollback: deletar pasta se algo deu errado
      if (folderName) {
        try {
          // Aqui poderíamos implementar lógica para deletar a pasta
          // Mas a API atual não tem endpoint para deletar pastas
        } catch {}
      }
      throw error;
    }
  }

  /**
   * Busca livros criados pelo usuário
   */
  static async getUserBooks(userId: string): Promise<Book[]> {
    const { data, error } = await supabase
      .from('books')
      .select(
        `
        *,
        categories:book_category_relations(
          category:book_categories(*)
        ),
        tags:book_tags(tag)
      `
      )
      .eq('author_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    // Transformar os dados para o formato esperado
    return (data || []).map((book) => ({
      ...book,
      categories: book.categories?.map((rel: any) => rel.category) || [],
      tags: book.tags?.map((t: any) => t.tag) || [],
    }));
  }

  /**
   * Busca livros na biblioteca do usuário
   */
  static async getUserLibrary(userId: string): Promise<UserLibraryItem[]> {
    const { data, error } = await supabase
      .from('user_library')
      .select(
        `
        *,
        book:books(
          *,
          author:profiles(id, full_name, avatar_url),
          categories:book_category_relations(
            category:book_categories(*)
          )
        )
      `
      )
      .eq('user_id', userId)
      .order('last_read_at', { ascending: false, nullsFirst: false });

    if (error) throw error;

    return (data || []).map((item) => ({
      ...item,
      book: {
        ...item.book,
        categories: item.book.categories?.map((rel: any) => rel.category) || [],
      },
    }));
  }

  /**
   * Adiciona um livro à biblioteca do usuário
   */
  static async addToLibrary(userId: string, bookId: string): Promise<UserLibraryItem> {
    const { data, error } = await supabase
      .from('user_library')
      .insert({
        user_id: userId,
        book_id: bookId,
        reading_progress: 0,
        is_favorite: false,
      })
      .select()
      .single();

    if (error) {
      // Se já existe, apenas retornar
      if (error.code === '23505') {
        const { data: existing } = await supabase
          .from('user_library')
          .select('*')
          .eq('user_id', userId)
          .eq('book_id', bookId)
          .single();

        if (existing) return existing;
      }
      throw error;
    }

    return data;
  }

  /**
   * Remove um livro da biblioteca do usuário
   */
  static async removeFromLibrary(userId: string, bookId: string): Promise<void> {
    const { error } = await supabase
      .from('user_library')
      .delete()
      .eq('user_id', userId)
      .eq('book_id', bookId);

    if (error) throw error;
  }

  /**
   * Verifica se um livro está na biblioteca do usuário
   */
  static async isInLibrary(userId: string, bookId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_library')
      .select('id')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  }

  /**
   * Atualiza um livro
   */
  static async updateBook(bookId: string, updates: UpdateBookData): Promise<Book> {
    const { data, error } = await supabase
      .from('books')
      .update(updates)
      .eq('id', bookId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Deleta um livro
   */
  static async deleteBook(bookId: string): Promise<void> {
    // Buscar informações do livro para deletar as imagens
    const { data: book, error: fetchError } = await supabase
      .from('books')
      .select('folder_name, cover_url, banner_url')
      .eq('id', bookId)
      .single();

    if (fetchError) throw fetchError;

    // Deletar o livro do banco (cascade vai deletar capítulos, tags, etc)
    const { error: deleteError } = await supabase.from('books').delete().eq('id', bookId);

    if (deleteError) throw deleteError;

    // Tentar deletar as imagens (não crítico se falhar)
    if (book?.folder_name) {
      try {
        if (book.cover_url) {
          const coverFilename = book.cover_url.split('/').pop();
          if (coverFilename) {
            await UploadService.deleteFile(book.folder_name, coverFilename);
          }
        }
        if (book.banner_url) {
          const bannerFilename = book.banner_url.split('/').pop();
          if (bannerFilename) {
            await UploadService.deleteFile(book.folder_name, bannerFilename);
          }
        }
      } catch (error) {
        console.warn('Erro ao deletar imagens:', error);
      }
    }
  }

  /**
   * Publica um livro
   */
  static async publishBook(bookId: string): Promise<Book> {
    const { data, error } = await supabase
      .from('books')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
      })
      .eq('id', bookId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Cria um capítulo
   */
  static async createChapter(chapterData: CreateChapterData): Promise<BookChapter> {
    const { data, error } = await supabase
      .from('book_chapters')
      .insert({
        book_id: chapterData.book_id,
        title: chapterData.title,
        chapter_number: chapterData.chapter_number,
        content: chapterData.content,
        content_format: chapterData.content_format || 'markdown',
        word_count: chapterData.content ? chapterData.content.split(/\s+/).length : 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Busca capítulos de um livro
   */
  static async getBookChapters(bookId: string): Promise<BookChapter[]> {
    const { data, error } = await supabase
      .from('book_chapters')
      .select('*')
      .eq('book_id', bookId)
      .order('chapter_number');

    if (error) throw error;
    return data || [];
  }

  static async getChapter(chapterId: string): Promise<BookChapter> {
    const { data, error } = await supabase
      .from('book_chapters')
      .select('*')
      .eq('id', chapterId)
      .single();

    if (error) throw error;
    return data;
  }

/**
 * Busca capítulos de um livro com informações básicas (sem conteúdo)
 */
  static async getBookChaptersBasic(bookId: string): Promise<Omit<BookChapter, 'content'>[]> {
    const { data, error } = await supabase
      .from('book_chapters')
      .select(
        'id, book_id, title, chapter_number, status, word_count, content_format, views_count, created_at, updated_at, published_at'
      )
      .eq('book_id', bookId)
      .order('chapter_number');

    if (error) throw error;
    return data || [];
  }
}