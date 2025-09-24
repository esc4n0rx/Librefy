const bookService = require('../services/book-service');

class BookController {

  // Livros
  async createBook(req, res, next) {
    try {
      const authorId = req.user.id;
      const book = await bookService.createBook(authorId, req.body);
      
      res.status(201).json({
        success: true,
        message: 'Livro criado com sucesso',
        data: book
      });
    } catch (error) {
      next(error);
    }
  }

  async getBook(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      const book = await bookService.getBookById(id, userId);
      
      res.status(200).json({
        success: true,
        message: 'Livro obtido com sucesso',
        data: book
      });
    } catch (error) {
      next(error);
    }
  }

  async updateBook(req, res, next) {
    try {
      const { id } = req.params;
      const authorId = req.user.id;
      
      const book = await bookService.updateBook(id, authorId, req.body);
      
      res.status(200).json({
        success: true,
        message: 'Livro atualizado com sucesso',
        data: book
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteBook(req, res, next) {
    try {
      const { id } = req.params;
      const authorId = req.user.id;
      
      const result = await bookService.deleteBook(id, authorId);
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadCover(req, res, next) {
    try {
      const { id } = req.params;
      const authorId = req.user.id;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Arquivo de imagem é obrigatório'
        });
      }

      const result = await bookService.uploadBookCover(id, authorId, req.file.buffer);
      
      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          cover_url: result.cover_url
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async publishBook(req, res, next) {
    try {
      const { id } = req.params;
      const authorId = req.user.id;
      
      const book = await bookService.publishBook(id, authorId);
      
      res.status(200).json({
        success: true,
        message: 'Livro publicado com sucesso',
        data: book
      });
    } catch (error) {
      next(error);
    }
  }

  async unpublishBook(req, res, next) {
    try {
      const { id } = req.params;
      const authorId = req.user.id;
      
      const book = await bookService.unpublishBook(id, authorId);
      
      res.status(200).json({
        success: true,
        message: 'Livro despublicado com sucesso',
        data: book
      });
    } catch (error) {
      next(error);
    }
  }

  async archiveBook(req, res, next) {
    try {
      const { id } = req.params;
      const authorId = req.user.id;
      
      const book = await bookService.archiveBook(id, authorId);
      
      res.status(200).json({
        success: true,
        message: 'Livro arquivado com sucesso',
        data: book
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyBooks(req, res, next) {
    try {
      const authorId = req.user.id;
      const { status } = req.query;
      
      const books = await bookService.getMyBooks(authorId, status);
      
      res.status(200).json({
        success: true,
        message: 'Livros obtidos com sucesso',
        data: books
      });
    } catch (error) {
      next(error);
    }
  }

  // Capítulos
  async addChapter(req, res, next) {
    try {
      const { id } = req.params; // book ID
      const authorId = req.user.id;
      
      const chapter = await bookService.addChapter(id, authorId, req.body);
      
      res.status(201).json({
        success: true,
        message: 'Capítulo adicionado com sucesso',
        data: chapter
      });
    } catch (error) {
      next(error);
    }
  }

  async updateChapter(req, res, next) {
    try {
      const { chapterId } = req.params;
      const authorId = req.user.id;
      
      const chapter = await bookService.updateChapter(chapterId, authorId, req.body);
      
      res.status(200).json({
        success: true,
        message: 'Capítulo atualizado com sucesso',
        data: chapter
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteChapter(req, res, next) {
    try {
      const { chapterId } = req.params;
      const authorId = req.user.id;
      
      const result = await bookService.deleteChapter(chapterId, authorId);
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  async getChapter(req, res, next) {
    try {
      const { chapterId } = req.params;
      const userId = req.user?.id;
      
      const chapter = await bookService.getChapterById(chapterId, userId);
      
      res.status(200).json({
        success: true,
        message: 'Capítulo obtido com sucesso',
        data: chapter
      });
    } catch (error) {
      next(error);
    }
  }

  async getBookChapters(req, res, next) {
    try {
      const { id } = req.params; // book ID
      const userId = req.user?.id;
      
      const chapters = await bookService.getBookChapters(id, userId);
      
      res.status(200).json({
        success: true,
        message: 'Capítulos obtidos com sucesso',
        data: chapters
      });
    } catch (error) {
      next(error);
    }
  }

  async publishChapter(req, res, next) {
    try {
      const { chapterId } = req.params;
      const authorId = req.user.id;
      
      const chapter = await bookService.publishChapter(chapterId, authorId);
      
      res.status(200).json({
        success: true,
        message: 'Capítulo publicado com sucesso',
        data: chapter
      });
    } catch (error) {
      next(error);
    }
  }

  async unpublishChapter(req, res, next) {
    try {
      const { chapterId } = req.params;
      const authorId = req.user.id;
      
      const chapter = await bookService.unpublishChapter(chapterId, authorId);
      
      res.status(200).json({
        success: true,
        message: 'Capítulo despublicado com sucesso',
        data: chapter
      });
    } catch (error) {
      next(error);
    }
  }

  async readChapter(req, res, next) {
    try {
      const { bookId, chapterNumber } = req.params;
      const userId = req.user?.id;
      const ipAddress = req.ip;
      const userAgent = req.get('User-Agent');
      
      const chapter = await bookService.readChapter(
        bookId, 
        parseInt(chapterNumber), 
        userId, 
        ipAddress, 
        userAgent
      );
      
      res.status(200).json({
        success: true,
        message: 'Capítulo obtido com sucesso',
        data: chapter
      });
    } catch (error) {
      next(error);
    }
  }

  async reorderChapters(req, res, next) {
    try {
      const { id } = req.params; // book ID
      const authorId = req.user.id;
      const { newOrder } = req.body;
      
      const result = await bookService.reorderChapters(id, authorId, newOrder);
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  // Funcionalidades públicas
  async searchBooks(req, res, next) {
    try {
      const { q: query, limit = 20, offset = 0 } = req.query;
      
      if (!query || query.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Parâmetro de busca é obrigatório'
        });
      }
      
      const books = await bookService.searchBooks(
        query.trim(), 
        parseInt(limit), 
        parseInt(offset)
      );
      
      res.status(200).json({
        success: true,
        message: 'Busca realizada com sucesso',
        data: books
      });
    } catch (error) {
      next(error);
    }
  }

  async getPublishedBooks(req, res, next) {
    try {
      const { limit = 20, offset = 0, orderBy = 'published_at' } = req.query;
      
      const books = await bookService.getPublishedBooks(
        parseInt(limit), 
        parseInt(offset), 
        orderBy
      );
      
      res.status(200).json({
        success: true,
        message: 'Livros obtidos com sucesso',
        data: books
      });
    } catch (error) {
      next(error);
    }
  }

  async likeBook(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const result = await bookService.likeBook(id, userId);
      
      res.status(200).json({
        success: true,
        message: result.liked ? 'Livro curtido' : 'Curtida removida',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BookController();