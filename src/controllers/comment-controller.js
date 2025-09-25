const commentService = require('../services/comment-service');

class CommentController {

  async createComment(req, res, next) {
    try {
      const userId = req.user.id;
      const { bookId } = req.params;
      const { content, parent_comment_id } = req.body;

      const comment = await commentService.createComment(userId, bookId, content, parent_comment_id);

      res.status(201).json({
        success: true,
        message: 'Comentário criado com sucesso',
        data: comment
      });
    } catch (error) {
      next(error);
    }
  }

  async getBookComments(req, res, next) {
    try {
      const { bookId } = req.params;
      const { limit = 50, offset = 0 } = req.query;
      const userId = req.user?.id;

      const result = await commentService.getBookComments(
        bookId,
        userId,
        parseInt(limit),
        parseInt(offset)
      );

      res.status(200).json({
        success: true,
        message: 'Comentários obtidos com sucesso',
        data: result.comments,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  async getCommentReplies(req, res, next) {
    try {
      const { commentId } = req.params;
      const { limit = 20, offset = 0 } = req.query;

      const result = await commentService.getCommentReplies(
        commentId,
        parseInt(limit),
        parseInt(offset)
      );
      res.status(200).json({
        success: true,
        message: 'Respostas obtidas com sucesso',
        data: result.replies,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  async updateComment(req, res, next) {
    try {
      const userId = req.user.id;
      const { commentId } = req.params;
      const { content } = req.body;

      const comment = await commentService.updateComment(userId, commentId, content);

      res.status(200).json({
        success: true,
        message: 'Comentário atualizado com sucesso',
        data: comment
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(req, res, next) {
    try {
      const userId = req.user.id;
      const { commentId } = req.params;

      const result = await commentService.deleteComment(userId, commentId);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  async getBookCommentStats(req, res, next) {
    try {
      const { bookId } = req.params;

      const stats = await commentService.getBookCommentStats(bookId);

      res.status(200).json({
        success: true,
        message: 'Estatísticas de comentários obtidas com sucesso',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserComments(req, res, next) {
    try {
      const userId = req.user.id;
      const { limit = 20, offset = 0 } = req.query;

      const result = await commentService.getUserComments(
        userId,
        parseInt(limit),
        parseInt(offset)
      );

      res.status(200).json({
        success: true,
        message: 'Comentários do usuário obtidos com sucesso',
        data: result.comments,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CommentController();