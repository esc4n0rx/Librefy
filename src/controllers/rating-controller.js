const ratingService = require('../services/rating-service');

class RatingController {

  async rateBook(req, res, next) {
    try {
      const userId = req.user.id;
      const { bookId } = req.params;
      const { rating } = req.body;

      const result = await ratingService.rateBook(userId, bookId, rating);

      res.status(200).json({
        success: true,
        message: 'Avaliação registrada com sucesso',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async removeRating(req, res, next) {
    try {
      const userId = req.user.id;
      const { bookId } = req.params;

      const result = await ratingService.removeRating(userId, bookId);

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          stats: result.stats
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserRating(req, res, next) {
    try {
      const userId = req.user.id;
      const { bookId } = req.params;

      const rating = await ratingService.getUserRating(userId, bookId);

      res.status(200).json({
        success: true,
        message: 'Avaliação obtida com sucesso',
        data: rating
      });
    } catch (error) {
      next(error);
    }
  }

  async getBookRatingStats(req, res, next) {
    try {
      const { bookId } = req.params;

      const stats = await ratingService.getBookRatingStats(bookId);

      res.status(200).json({
        success: true,
        message: 'Estatísticas de avaliação obtidas com sucesso',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserRatings(req, res, next) {
    try {
      const userId = req.user.id;
      const { limit = 20, offset = 0 } = req.query;

      const result = await ratingService.getUserRatings(
        userId,
        parseInt(limit),
        parseInt(offset)
      );

      res.status(200).json({
        success: true,
        message: 'Avaliações do usuário obtidas com sucesso',
        data: result.ratings,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RatingController();