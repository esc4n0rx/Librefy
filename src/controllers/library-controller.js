const libraryService = require('../services/library-service');

class LibraryController {

  async addToLibrary(req, res, next) {
    try {
      const userId = req.user.id;
      const { bookId } = req.body;

      const result = await libraryService.addBookToLibrary(userId, bookId);

      res.status(201).json({
        success: true,
        message: result.message,
        data: {
          id: result.id,
          book_id: result.book_id,
          added_at: result.added_at
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async removeFromLibrary(req, res, next) {
    try {
      const userId = req.user.id;
      const { bookId } = req.params;

      const result = await libraryService.removeBookFromLibrary(userId, bookId);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  async getLibrary(req, res, next) {
    try {
      const userId = req.user.id;
      const { limit = 20, offset = 0 } = req.query;

      const result = await libraryService.getUserLibrary(
        userId, 
        parseInt(limit), 
        parseInt(offset)
      );

      res.status(200).json({
        success: true,
        message: 'Biblioteca obtida com sucesso',
        data: result.books,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  async createOfflineLicense(req, res, next) {
    try {
      const userId = req.user.id;
      const { bookId } = req.params;
      const { deviceId } = req.body;

      if (!deviceId) {
        return res.status(400).json({
          success: false,
          message: 'Device ID é obrigatório'
        });
      }

      const result = await libraryService.createOfflineLicense(userId, bookId, deviceId);

      res.status(result.message.includes('criada') ? 201 : 200).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  }

  async revokeOfflineLicense(req, res, next) {
    try {
      const userId = req.user.id;
      const { bookId } = req.params;
      const { deviceId } = req.query;

      const result = await libraryService.revokeOfflineLicense(userId, bookId, deviceId);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  async getOfflineLicenses(req, res, next) {
    try {
      const userId = req.user.id;
      const { deviceId } = req.query;

      const result = await libraryService.getUserOfflineLicenses(userId, deviceId);

      res.status(200).json({
        success: true,
        message: 'Licenças offline obtidas com sucesso',
        data: result.licenses,
        total: result.total
      });
    } catch (error) {
      next(error);
    }
  }

  async renewOfflineLicense(req, res, next) {
    try {
      const userId = req.user.id;
      const { bookId } = req.params;
      const { deviceId } = req.body;

      const result = await libraryService.renewOfflineLicense(userId, bookId, deviceId);

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          license_id: result.license_id,
          expires_at: result.expires_at
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async cleanupExpired(req, res, next) {
    try {
      await libraryService.cleanupExpiredLicenses();

      res.status(200).json({
        success: true,
        message: 'Limpeza de licenças expiradas concluída'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LibraryController();