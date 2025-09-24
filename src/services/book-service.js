const bookModel = require('../models/book-model');
const chapterModel = require('../models/chapter-model');
const cloudinaryService = require('./cloudinary-service');
const { generateUniqueSlug } = require('../utils/slug-utils');

class BookService {
  
  async createBook(authorId, bookData) {
    const { title, description, tags, visibility } = bookData;

    // Validações
    if (!title || title.trim().length === 0) {
      throw new Error('Título é obrigatório');
    }

    if (title.length > 200) {
      throw new Error('Título deve ter no máximo 200 caracteres');
    }

    if (description && description.length > 2000) {
      throw new Error('Descrição deve ter no máximo 2000 caracteres');
    }

    if (tags && tags.length > 10) {
      throw new Error('Máximo 10 tags permitidas');
    }

    // Criar livro
    const book = await bookModel.create({
      author_id: authorId,
      title,
      description,
      tags: tags || [],
      visibility: visibility || 'public'
    });

    return book;
  }

  async getBookById(bookId, userId = null) {
    const book = await bookModel.findById(bookId, true);
    
    if (!book) {
      throw new Error('Livro não encontrado');
    }

    // Verificar permissão de acesso
    if (book.visibility === 'private' && book.author_id !== userId) {
        throw new Error('Acesso negado');
      }
  
      // Se não é o autor, só mostrar capítulos publicados
      if (book.author_id !== userId) {
        book.chapters = book.chapters?.filter(chapter => chapter.is_published) || [];
      }
  
      // Ordenar capítulos por número
      if (book.chapters) {
        book.chapters.sort((a, b) => a.chapter_number - b.chapter_number);
      }
  
      return book;
    }
  
    async updateBook(bookId, authorId, updates) {
      // Verificar propriedade
      const existingBook = await bookModel.findById(bookId);
      if (!existingBook) {
        throw new Error('Livro não encontrado');
      }
  
      if (existingBook.author_id !== authorId) {
        throw new Error('Acesso negado');
      }
  
      // Validações
      if (updates.title !== undefined) {
        if (!updates.title || updates.title.trim().length === 0) {
          throw new Error('Título é obrigatório');
        }
        if (updates.title.length > 200) {
          throw new Error('Título deve ter no máximo 200 caracteres');
        }
      }
  
      if (updates.description !== undefined && updates.description.length > 2000) {
        throw new Error('Descrição deve ter no máximo 2000 caracteres');
      }
  
      if (updates.tags && updates.tags.length > 10) {
        throw new Error('Máximo 10 tags permitidas');
      }
  
      // Se mudou o título, gerar novo slug
      if (updates.title && updates.title !== existingBook.title) {
        updates.slug = await bookModel.generateUniqueSlug(updates.title, bookId);
      }
  
      const updatedBook = await bookModel.update(bookId, updates);
      return updatedBook;
    }
  
    async deleteBook(bookId, authorId) {
      // Verificar propriedade
      const book = await bookModel.findById(bookId);
      if (!book) {
        throw new Error('Livro não encontrado');
      }
  
      if (book.author_id !== authorId) {
        throw new Error('Acesso negado');
      }
  
      // Deletar capa se existir
      if (book.cover_url) {
        const publicId = cloudinaryService.extractPublicIdFromUrl(book.cover_url);
        if (publicId) {
          await cloudinaryService.deleteBookCover(publicId);
        }
      }
  
      await bookModel.delete(bookId);
      return { message: 'Livro deletado com sucesso' };
    }
  
    async uploadBookCover(bookId, authorId, fileBuffer) {
      // Verificar propriedade
      const book = await bookModel.findById(bookId);
      if (!book) {
        throw new Error('Livro não encontrado');
      }
  
      if (book.author_id !== authorId) {
        throw new Error('Acesso negado');
      }
  
      // Deletar capa anterior se existir
      if (book.cover_url) {
        const oldPublicId = cloudinaryService.extractPublicIdFromUrl(book.cover_url);
        if (oldPublicId) {
          await cloudinaryService.deleteBookCover(oldPublicId);
        }
      }
  
      // Upload nova capa
      const uploadResult = await cloudinaryService.uploadBookCover(fileBuffer, bookId);
  
      // Atualizar URL no banco
      const updatedBook = await bookModel.update(bookId, {
        cover_url: uploadResult.secure_url
      });
  
      return {
        cover_url: updatedBook.cover_url,
        message: 'Capa atualizada com sucesso'
      };
    }
  
    async publishBook(bookId, authorId) {
      // Verificar propriedade
      const book = await bookModel.findById(bookId, true);
      if (!book) {
        throw new Error('Livro não encontrado');
      }
  
      if (book.author_id !== authorId) {
        throw new Error('Acesso negado');
      }
  
      if (book.status === 'published') {
        throw new Error('Livro já está publicado');
      }
  
      // Verificar se tem pelo menos um capítulo
      if (!book.chapters || book.chapters.length === 0) {
        throw new Error('Livro deve ter pelo menos um capítulo para ser publicado');
      }
  
      // Gerar slug se não tiver
      let updates = {};
      if (!book.slug) {
        updates.slug = await bookModel.generateUniqueSlug(book.title);
      }
  
      // Publicar livro
      const publishedBook = await bookModel.publish(bookId);
      
      // Atualizar slug se necessário
      if (updates.slug) {
        await bookModel.update(bookId, updates);
        publishedBook.slug = updates.slug;
      }
  
      return publishedBook;
    }
  
    async unpublishBook(bookId, authorId) {
      // Verificar propriedade
      const book = await bookModel.findById(bookId);
      if (!book) {
        throw new Error('Livro não encontrado');
      }
  
      if (book.author_id !== authorId) {
        throw new Error('Acesso negado');
      }
  
      if (book.status !== 'published') {
        throw new Error('Livro não está publicado');
      }
  
      const unpublishedBook = await bookModel.unpublish(bookId);
      return unpublishedBook;
    }
  
    async archiveBook(bookId, authorId) {
      // Verificar propriedade
      const book = await bookModel.findById(bookId);
      if (!book) {
        throw new Error('Livro não encontrado');
      }
  
      if (book.author_id !== authorId) {
        throw new Error('Acesso negado');
      }
  
      const archivedBook = await bookModel.archive(bookId);
      return archivedBook;
    }
  
    async getMyBooks(authorId, status = null) {
      const books = await bookModel.findByAuthor(authorId, status);
      return books;
    }
  
    async addChapter(bookId, authorId, chapterData) {
      const { title, content_md, chapter_number } = chapterData;
  
      // Verificar propriedade do livro
      const book = await bookModel.findById(bookId);
      if (!book) {
        throw new Error('Livro não encontrado');
      }
  
      if (book.author_id !== authorId) {
        throw new Error('Acesso negado');
      }
  
      // Validações
      if (!title || title.trim().length === 0) {
        throw new Error('Título do capítulo é obrigatório');
      }
  
      if (!content_md || content_md.trim().length === 0) {
        throw new Error('Conteúdo do capítulo é obrigatório');
      }
  
      if (title.length > 200) {
        throw new Error('Título do capítulo deve ter no máximo 200 caracteres');
      }
  
      const chapter = await chapterModel.create({
        book_id: bookId,
        author_id: authorId,
        title,
        content_md,
        chapter_number
      });
  
      return chapter;
    }
  
    async updateChapter(chapterId, authorId, updates) {
      // Verificar propriedade
      const chapter = await chapterModel.findById(chapterId);
      if (!chapter) {
        throw new Error('Capítulo não encontrado');
      }
  
      if (chapter.author_id !== authorId) {
        throw new Error('Acesso negado');
      }
  
      // Validações
      if (updates.title !== undefined) {
        if (!updates.title || updates.title.trim().length === 0) {
          throw new Error('Título do capítulo é obrigatório');
        }
        if (updates.title.length > 200) {
          throw new Error('Título do capítulo deve ter no máximo 200 caracteres');
        }
      }
  
      if (updates.content_md !== undefined) {
        if (!updates.content_md || updates.content_md.trim().length === 0) {
          throw new Error('Conteúdo do capítulo é obrigatório');
        }
      }
  
      const updatedChapter = await chapterModel.update(chapterId, updates);
      return updatedChapter;
    }
  
    async deleteChapter(chapterId, authorId) {
      // Verificar propriedade
      const chapter = await chapterModel.findById(chapterId);
      if (!chapter) {
        throw new Error('Capítulo não encontrado');
      }
  
      if (chapter.author_id !== authorId) {
        throw new Error('Acesso negado');
      }
  
      await chapterModel.delete(chapterId);
      return { message: 'Capítulo deletado com sucesso' };
    }
  
    async getChapterById(chapterId, userId = null) {
      const chapter = await chapterModel.findById(chapterId);
      
      if (!chapter) {
        throw new Error('Capítulo não encontrado');
      }
  
      // Verificar permissão de acesso
      const book = chapter.books;
      if (book.status !== 'published' && book.author_id !== userId) {
        throw new Error('Capítulo não encontrado');
      }
  
      if (!chapter.is_published && book.author_id !== userId) {
        throw new Error('Capítulo não encontrado');
      }
  
      return chapter;
    }
  
    async getBookChapters(bookId, userId = null) {
      // Verificar se livro existe e permissão de acesso
      const book = await bookModel.findById(bookId);
      if (!book) {
        throw new Error('Livro não encontrado');
      }
  
      if (book.visibility === 'private' && book.author_id !== userId) {
        throw new Error('Acesso negado');
      }
  
      // Buscar capítulos
      const includeUnpublished = book.author_id === userId;
      const chapters = await chapterModel.findByBook(bookId, includeUnpublished);
  
      return chapters;
    }
  
    async publishChapter(chapterId, authorId) {
      // Verificar propriedade
      const chapter = await chapterModel.findById(chapterId);
      if (!chapter) {
        throw new Error('Capítulo não encontrado');
      }
  
      if (chapter.author_id !== authorId) {
        throw new Error('Acesso negado');
      }
  
      if (chapter.is_published) {
        throw new Error('Capítulo já está publicado');
      }
  
      const publishedChapter = await chapterModel.publish(chapterId);
      return publishedChapter;
    }
  
    async unpublishChapter(chapterId, authorId) {
      // Verificar propriedade
      const chapter = await chapterModel.findById(chapterId);
      if (!chapter) {
        throw new Error('Capítulo não encontrado');
      }
  
      if (chapter.author_id !== authorId) {
        throw new Error('Acesso negado');
      }
  
      if (!chapter.is_published) {
        throw new Error('Capítulo não está publicado');
      }
  
      const unpublishedChapter = await chapterModel.unpublish(chapterId);
      return unpublishedChapter;
    }
  
    async searchBooks(query, limit = 20, offset = 0) {
      const books = await bookModel.search(query, limit, offset);
      return books;
    }
  
    async getPublishedBooks(limit = 20, offset = 0, orderBy = 'published_at') {
      const books = await bookModel.findPublished(limit, offset, orderBy);
      return books;
    }
  
    async likeBook(bookId, userId) {
      // Verificar se livro existe e está publicado
      const book = await bookModel.findById(bookId);
      if (!book) {
        throw new Error('Livro não encontrado');
      }
  
      if (book.status !== 'published') {
        throw new Error('Livro não está publicado');
      }
  
      const result = await bookModel.toggleLike(bookId, userId);
      return result;
    }
  
    async readChapter(bookId, chapterNumber, userId = null, ipAddress = null, userAgent = null) {
      // Buscar capítulo
      const chapter = await chapterModel.getByBookAndNumber(bookId, chapterNumber);
      if (!chapter) {
        throw new Error('Capítulo não encontrado');
      }
  
      const book = chapter.books;
  
      // Verificar permissões
      if (book.status !== 'published' && book.author_id !== userId) {
        throw new Error('Capítulo não encontrado');
      }
  
      if (!chapter.is_published && book.author_id !== userId) {
        throw new Error('Capítulo não encontrado');
      }
  
      if (book.visibility === 'private' && book.author_id !== userId) {
        throw new Error('Acesso negado');
      }
  
      // Incrementar contador de leitura (apenas para leitores, não para o autor)
      if (book.author_id !== userId) {
        await bookModel.incrementRead(bookId, userId, ipAddress, userAgent);
      }
  
      return chapter;
    }
  
    async reorderChapters(bookId, authorId, newOrder) {
      // Verificar propriedade
      const book = await bookModel.findById(bookId);
      if (!book) {
        throw new Error('Livro não encontrado');
      }
  
      if (book.author_id !== authorId) {
        throw new Error('Acesso negado');
      }
  
      // Validar ordem
      if (!Array.isArray(newOrder) || newOrder.length === 0) {
        throw new Error('Nova ordem inválida');
      }
  
      // Verificar se todos os IDs pertencem ao livro
      const chapters = await chapterModel.findByBook(bookId, true);
      const chapterIds = chapters.map(c => c.id);
      
      for (const item of newOrder) {
        if (!chapterIds.includes(item.chapterId)) {
          throw new Error('Capítulo inválido na reordenação');
        }
      }
  
      await chapterModel.reorder(bookId, newOrder);
      return { message: 'Capítulos reordenados com sucesso' };
    }
  }
  
  module.exports = new BookService();