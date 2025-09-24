const express = require('express');
const bookController = require('../controllers/book-controller');
const authMiddleware = require('../middleware/auth-middleware');
const { uploadBookCover } = require('../middleware/upload-middleware');
const { validateBody, validateQuery } = require('../middleware/validation-middleware');
const { 
  createBookSchema, 
  updateBookSchema, 
  createChapterSchema, 
  updateChapterSchema,
  reorderChaptersSchema,
  searchBooksSchema,
  getPublishedBooksSchema
} = require('../utils/validation-schemas');

const router = express.Router();

// Rotas públicas
router.get('/search', validateQuery(searchBooksSchema), bookController.searchBooks);
router.get('/published', validateQuery(getPublishedBooksSchema), bookController.getPublishedBooks);

// Middleware de autenticação opcional para algumas rotas
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // Se tem token, validar
    return authMiddleware(req, res, next);
  } else {
    // Se não tem token, continuar sem autenticação
    req.user = null;
    next();
  }
};

// Rotas com autenticação opcional
router.get('/:id', optionalAuth, bookController.getBook);
router.get('/:id/chapters', optionalAuth, bookController.getBookChapters);
router.get('/:bookId/chapter/:chapterNumber', optionalAuth, bookController.readChapter);
router.get('/chapter/:chapterId', optionalAuth, bookController.getChapter);

// Rotas protegidas (requer autenticação)
router.use(authMiddleware);

// CRUD de livros
router.post('/', validateBody(createBookSchema), bookController.createBook);
router.put('/:id', validateBody(updateBookSchema), bookController.updateBook);
router.delete('/:id', bookController.deleteBook);

// Ações de livros
router.post('/:id/publish', bookController.publishBook);
router.post('/:id/unpublish', bookController.unpublishBook);
router.post('/:id/archive', bookController.archiveBook);
router.post('/:id/like', bookController.likeBook);

// Upload de capa
router.post('/:id/cover', uploadBookCover, bookController.uploadCover);

// Meus livros
router.get('/my/books', bookController.getMyBooks);

// CRUD de capítulos
router.post('/:id/chapters', validateBody(createChapterSchema), bookController.addChapter);
router.put('/chapter/:chapterId', validateBody(updateChapterSchema), bookController.updateChapter);
router.delete('/chapter/:chapterId', bookController.deleteChapter);

// Ações de capítulos
router.post('/chapter/:chapterId/publish', bookController.publishChapter);
router.post('/chapter/:chapterId/unpublish', bookController.unpublishChapter);

// Reordenar capítulos
router.put('/:id/reorder-chapters', validateBody(reorderChaptersSchema), bookController.reorderChapters);

module.exports = router;