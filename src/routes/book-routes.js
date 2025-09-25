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

router.get('/search', validateQuery(searchBooksSchema), bookController.searchBooks);
router.get('/published', validateQuery(getPublishedBooksSchema), bookController.getPublishedBooks);

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authMiddleware(req, res, next);
  } else {
    req.user = null;
    next();
  }
};

router.get('/:id', optionalAuth, bookController.getBook);
router.get('/:id/chapters', optionalAuth, bookController.getBookChapters);
router.get('/:bookId/chapter/:chapterNumber', optionalAuth, bookController.readChapter);
router.get('/chapter/:chapterId', optionalAuth, bookController.getChapter);

router.use(authMiddleware);

router.post('/', validateBody(createBookSchema), bookController.createBook);
router.put('/:id', validateBody(updateBookSchema), bookController.updateBook);
router.delete('/:id', bookController.deleteBook);

router.post('/:id/publish', bookController.publishBook);
router.post('/:id/unpublish', bookController.unpublishBook);
router.post('/:id/archive', bookController.archiveBook);
router.post('/:id/like', bookController.likeBook);

router.post('/:id/cover', uploadBookCover, bookController.uploadCover);

router.get('/my/books', bookController.getMyBooks);

router.post('/:id/chapters', validateBody(createChapterSchema), bookController.addChapter);
router.put('/chapter/:chapterId', validateBody(updateChapterSchema), bookController.updateChapter);
router.delete('/chapter/:chapterId', bookController.deleteChapter);

router.post('/chapter/:chapterId/publish', bookController.publishChapter);
router.post('/chapter/:chapterId/unpublish', bookController.unpublishChapter);

router.put('/:id/reorder-chapters', validateBody(reorderChaptersSchema), bookController.reorderChapters);

module.exports = router;