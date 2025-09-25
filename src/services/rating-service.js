const ratingModel = require('../models/rating-model');
const bookModel = require('../models/book-model');

class RatingService {
  
  async rateBook(userId, bookId, rating) {
    // Verificar se o livro existe e está publicado
    const book = await bookModel.findById(bookId);
    if (!book) {
      throw new Error('Livro não encontrado');
    }

    if (book.status !== 'published') {
      throw new Error('Só é possível avaliar livros publicados');
    }

    // Não permitir autoavaliação
    if (book.author_id === userId) {
      throw new Error('Você não pode avaliar seu próprio livro');
    }

    // Validar rating
    if (rating < 1 || rating > 5) {
      throw new Error('Avaliação deve ser entre 1 e 5 estrelas');
    }

    // Criar ou atualizar avaliação
    const ratingData = await ratingModel.createOrUpdateRating(userId, bookId, rating);
    
    // Obter estatísticas atualizadas
    const stats = await ratingModel.getBookRatingStats(bookId);

    return {
      rating: ratingData,
      stats: {
        average_rating: parseFloat(stats.average_rating) || 0,
        ratings_count: stats.ratings_count || 0
      }
    };
  }

  async removeRating(userId, bookId) {
    // Verificar se existe avaliação
    const existingRating = await ratingModel.getUserRating(userId, bookId);
    if (!existingRating) {
      throw new Error('Você não avaliou este livro');
    }

    // Remover avaliação
    await ratingModel.deleteRating(userId, bookId);

    // Obter estatísticas atualizadas
    const stats = await ratingModel.getBookRatingStats(bookId);

    return {
      message: 'Avaliação removida com sucesso',
      stats: {
        average_rating: parseFloat(stats.average_rating) || 0,
        ratings_count: stats.ratings_count || 0
      }
    };
  }

  async getUserRating(userId, bookId) {
    return await ratingModel.getUserRating(userId, bookId);
  }

  async getBookRatingStats(bookId) {
    const stats = await ratingModel.getBookRatingStats(bookId);
    const distribution = await ratingModel.getBookRatingDistribution(bookId);

    return {
      average_rating: parseFloat(stats.average_rating) || 0,
      ratings_count: stats.ratings_count || 0,
      distribution: distribution.distribution
    };
  }

  async getUserRatings(userId, limit = 20, offset = 0) {
    const ratings = await ratingModel.getUserRatings(userId, limit, offset);
    
    return {
      ratings: ratings.map(rating => ({
        id: rating.id,
        rating: rating.rating,
        created_at: rating.created_at,
        updated_at: rating.updated_at,
        book: {
          id: rating.books.id,
          title: rating.books.title,
          cover_url: rating.books.cover_url,
          status: rating.books.status,
          author: {
            name: rating.books.users.name,
            username: rating.books.users.username,
            avatar_url: rating.books.users.avatar_url
          }
        }
      })),
      pagination: {
        limit,
        offset,
        total: ratings.length
      }
    };
  }
}

module.exports = new RatingService();