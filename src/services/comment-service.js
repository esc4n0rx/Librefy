const commentModel = require('../models/comment-model');
const bookModel = require('../models/book-model');

class CommentService {
  
  async createComment(userId, bookId, content, parentCommentId = null) {
    // Verificar se o livro existe e está publicado
    const book = await bookModel.findById(bookId);
    if (!book) {
      throw new Error('Livro não encontrado');
    }

    if (book.status !== 'published') {
      throw new Error('Só é possível comentar em livros publicados');
    }

    // Se é uma resposta, verificar se o comentário pai existe
    if (parentCommentId) {
      const parentComment = await commentModel.findById(parentCommentId);
      if (!parentComment) {
        throw new Error('Comentário pai não encontrado');
      }
      if (parentComment.book_id !== bookId) {
        throw new Error('Comentário pai não pertence a este livro');
      }
      if (parentComment.is_deleted) {
        throw new Error('Não é possível responder a um comentário deletado');
      }
    }

    // Validar conteúdo
    if (!content || content.trim().length === 0) {
      throw new Error('Conteúdo do comentário é obrigatório');
    }

    if (content.length > 1000) {
      throw new Error('Comentário deve ter no máximo 1000 caracteres');
    }

    // Criar comentário
    const comment = await commentModel.createComment({
      user_id: userId,
      book_id: bookId,
      content,
      parent_comment_id: parentCommentId
    });

    return comment;
  }

  async getBookComments(bookId, userId = null, limit = 50, offset = 0) {
    // Verificar se o livro existe
    const book = await bookModel.findById(bookId);
    if (!book) {
      throw new Error('Livro não encontrado');
    }

    // Verificar acesso ao livro
    if (book.status !== 'published' && book.author_id !== userId) {
      throw new Error('Acesso negado');
    }

    if (book.visibility === 'private' && book.author_id !== userId) {
      throw new Error('Acesso negado');
    }

    // Buscar comentários principais (sem parent)
    const comments = await commentModel.findByBook(bookId, limit, offset);

    return {
      comments,
      pagination: {
        limit,
        offset,
        total: comments.length
      }
    };
  }

  async getCommentReplies(commentId, limit = 20, offset = 0) {
    // Verificar se o comentário existe
    const comment = await commentModel.findById(commentId);
    if (!comment) {
      throw new Error('Comentário não encontrado');
    }

    if (comment.is_deleted) {
      throw new Error('Comentário não encontrado');
    }

    // Buscar respostas
    const replies = await commentModel.findReplies(commentId, limit, offset);

    return {
      replies: replies.filter(reply => !reply.is_deleted),
      pagination: {
        limit,
        offset,
        total: replies.length
      }
    };
  }

  async updateComment(userId, commentId, content) {
    // Verificar se o comentário existe e pertence ao usuário
    const comment = await commentModel.findById(commentId);
    if (!comment) {
      throw new Error('Comentário não encontrado');
    }

    if (comment.user_id !== userId) {
      throw new Error('Você só pode editar seus próprios comentários');
    }

    if (comment.is_deleted) {
      throw new Error('Não é possível editar comentário deletado');
    }

    // Validar conteúdo
    if (!content || content.trim().length === 0) {
      throw new Error('Conteúdo do comentário é obrigatório');
    }

    if (content.length > 1000) {
      throw new Error('Comentário deve ter no máximo 1000 caracteres');
    }

    // Atualizar comentário
    const updatedComment = await commentModel.updateComment(commentId, content);
    return updatedComment;
  }

  async deleteComment(userId, commentId) {
    // Verificar se o comentário existe
    const comment = await commentModel.findById(commentId);
    if (!comment) {
      throw new Error('Comentário não encontrado');
    }

    if (comment.is_deleted) {
      throw new Error('Comentário já foi deletado');
    }

    // Verificar permissão (próprio usuário ou autor do livro)
    const book = await bookModel.findById(comment.book_id);
    const canDelete = comment.user_id === userId || book.author_id === userId;
    
    if (!canDelete) {
      throw new Error('Você não tem permissão para deletar este comentário');
    }

    // Soft delete
    await commentModel.softDeleteComment(commentId, userId);

    return { message: 'Comentário deletado com sucesso' };
  }

  async getBookCommentStats(bookId) {
    const stats = await commentModel.getCommentStats(bookId);
    return {
      comments_count: stats.comments_count || 0
    };
  }

  async getUserComments(userId, limit = 20, offset = 0) {
    const comments = await commentModel.getUserComments(userId, limit, offset);
    
    return {
      comments: comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        is_deleted: comment.is_deleted,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        book: {
          id: comment.books.id,
          title: comment.books.title,
          cover_url: comment.books.cover_url,
          status: comment.books.status,
          author: {
            name: comment.books.users.name,
            username: comment.books.users.username,
            avatar_url: comment.books.users.avatar_url
          }
        }
      })),
      pagination: {
        limit,
        offset,
        total: comments.length
      }
    };
  }
}

module.exports = new CommentService();