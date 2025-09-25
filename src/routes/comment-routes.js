const express = require('express');
const commentController = require('../controllers/comment-controller');
const authMiddleware = require('../middleware/auth-middleware');
const { validateBody, validateQuery } = require('../middleware/validation-middleware');
const { 
  createCommentSchema,
  updateCommentSchema,
  getCommentsSchema
} = require('../utils/validation-schemas');

const router = express.Router();

// Middleware de autenticação opcional para visualização
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authMiddleware(req, res, next);
  } else {
    req.user = null;
    next();
  }
};

// Rotas públicas (com auth opcional)
router.get('/book/:bookId', optionalAuth, validateQuery(getCommentsSchema), commentController.getBookComments);
router.get('/book/:bookId/stats', commentController.getBookCommentStats);
router.get('/:commentId/replies', validateQuery(getCommentsSchema), commentController.getCommentReplies);

// Middleware de autenticação obrigatória para rotas protegidas
router.use(authMiddleware);

// Rotas protegidas
router.post('/book/:bookId', validateBody(createCommentSchema), commentController.createComment);
router.put('/:commentId', validateBody(updateCommentSchema), commentController.updateComment);
router.delete('/:commentId', commentController.deleteComment);
router.get('/my-comments', validateQuery(getCommentsSchema), commentController.getUserComments);

module.exports = router;