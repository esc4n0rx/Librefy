// services/review.service.ts

import { BookReview, BookStats, CreateReviewData } from '@/types/review.types';
import { supabase } from './supabase';

export class ReviewService {
  /**
   * Busca reviews de um livro
   */
  static async getBookReviews(
    bookId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<BookReview[]> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
      .from('book_reviews')
      .select(
        `
        *,
        user:profiles(id, full_name, avatar_url)
      `
      )
      .eq('book_id', bookId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return data || [];
  }

  /**
   * Busca estatísticas de avaliação de um livro
   */
  static async getBookStats(bookId: string): Promise<BookStats> {
    // Buscar todas as avaliações
    const { data: reviews, error } = await supabase
      .from('book_reviews')
      .select('rating')
      .eq('book_id', bookId);

    if (error) throw error;

    const ratings = reviews || [];
    const total_ratings = ratings.length;

    if (total_ratings === 0) {
      return {
        total_ratings: 0,
        average_rating: 0,
        total_reviews: 0,
        rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    // Calcular média
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    const average_rating = sum / total_ratings;

    // Calcular distribuição
    const distribution = ratings.reduce(
      (acc, r) => {
        acc[r.rating as keyof typeof acc]++;
        return acc;
      },
      { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    );

    // Contar reviews com comentário
    const { count: total_reviews } = await supabase
      .from('book_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('book_id', bookId)
      .not('comment', 'is', null)
      .neq('comment', '');

    return {
      total_ratings,
      average_rating: Math.round(average_rating * 10) / 10,
      total_reviews: total_reviews || 0,
      rating_distribution: distribution,
    };
  }

  /**
   * Cria ou atualiza uma review
   */
  static async upsertReview(
    userId: string,
    reviewData: CreateReviewData
  ): Promise<BookReview> {
    const { data, error } = await supabase
      .from('book_reviews')
      .upsert(
        {
          user_id: userId,
          book_id: reviewData.book_id,
          rating: reviewData.rating,
          comment: reviewData.comment,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,book_id',
        }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Busca a review do usuário para um livro específico
   */
  static async getUserReview(
    userId: string,
    bookId: string
  ): Promise<BookReview | null> {
    const { data, error } = await supabase
      .from('book_reviews')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /**
   * Deleta uma review
   */
  static async deleteReview(reviewId: string): Promise<void> {
    const { error } = await supabase
      .from('book_reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;
  }
}