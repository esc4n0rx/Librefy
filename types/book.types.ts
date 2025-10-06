// types/book.types.ts

export type BookStatus = 'draft' | 'published' | 'archived';
export type ChapterStatus = 'draft' | 'published';
export type ContentFormat = 'markdown' | 'html' | 'plaintext';
export type AgeRating = 'livre' | '10' | '12' | '14' | '16' | '18';

export interface BookCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  created_at: string;
}

export interface Book {
  id: string;
  author_id: string;
  title: string;
  synopsis?: string;
  age_rating?: AgeRating;
  cover_url?: string;
  banner_url?: string;
  folder_name?: string;
  status: BookStatus;
  is_complete: boolean;
  total_chapters: number;
  total_words: number;
  views_count: number;
  likes_count: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
  metadata?: Record<string, any>;
  
  // Relações (podem ser carregadas via join)
  author?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  };
  categories?: BookCategory[];
  tags?: string[];
}

export interface BookChapter {
  id: string;
  book_id: string;
  title: string;
  chapter_number: number;
  content?: string;
  content_format: ContentFormat;
  word_count: number;
  views_count: number;
  status: ChapterStatus;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface UserLibraryItem {
  id: string;
  user_id: string;
  book_id: string;
  current_chapter_id?: string;
  reading_progress: number;
  last_read_at?: string;
  is_favorite: boolean;
  added_at: string;
  
  // Relação com o livro
  book?: Book;
}

export interface CreateBookData {
  title: string;
  synopsis?: string;
  age_rating?: AgeRating;
  category_ids: string[];
  tags: string[];
  cover_file?: {
    uri: string;
    name: string;
    type: string;
  };
  banner_file?: {
    uri: string;
    name: string;
    type: string;
  };
}

export interface UpdateBookData {
  title?: string;
  synopsis?: string;
  age_rating?: AgeRating;
  status?: BookStatus;
  is_complete?: boolean;
}

export interface CreateChapterData {
  book_id: string;
  title: string;
  chapter_number: number;
  content?: string;
  content_format?: ContentFormat;
}