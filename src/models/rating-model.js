const { supabaseAdmin } = require('../config/database');

class RatingModel {
  
  async createOrUpdateRating(userId, bookId, rating) {
    const { data, error } = await supabaseAdmin
      .from('book_ratings')
      .upsert([{
        user_id: userId,
        book_id: bookId,
        rating: rating
      }], {
        onConflict: 'user_id,book_id'
      })
      .select('id, rating, created_at, updated_at')
      .single();
    
    if (error) throw error;
    return data;
  }

  async getUserRating(userId, bookId) {
    const { data, error } = await supabaseAdmin
      .from('book_ratings')
      .select('rating, created_at, updated_at')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async deleteRating(userId, bookId) {
    const { error } = await supabaseAdmin
      .from('book_ratings')
      .delete()
      .eq('user_id', userId)
      .eq('book_id', bookId);
    
    if (error) throw error;
    return true;
  }

  async getBookRatingStats(bookId) {
    const { data, error } = await supabaseAdmin
      .from('books')
      .select('average_rating, ratings_count')
      .eq('id', bookId)
      .single();
    
    if (error) throw error;
    return data;
  }

  async getBookRatingDistribution(bookId) {
    const { data, error } = await supabaseAdmin
      .from('book_ratings')
      .select('rating')
      .eq('book_id', bookId);
    
    if (error) throw error;
    
    // Calcular distribuição
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    data.forEach(rating => {
      distribution[rating.rating]++;
    });
    
    return {
      distribution,
      total: data.length,
      ratings: data
    };
  }

  async getUserRatings(userId, limit = 20, offset = 0) {
    const { data, error } = await supabaseAdmin
      .from('book_ratings')
      .select(`
        id, rating, created_at, updated_at,
        books!inner(id, title, cover_url, status, author_id,
          users!inner(name, username, avatar_url)
        )
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data;
  }
}

module.exports = new RatingModel();