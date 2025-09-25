const libraryModel = require('../models/library-model');
const bookModel = require('../models/book-model');
const encryptionUtils = require('../utils/encryption-utils');
const supabaseStorageService = require('./supabase-storage-service');

class LibraryService {
  
  // Biblioteca pessoal
  async addBookToLibrary(userId, bookId) {
    // Verificar se o livro existe e está acessível
    const book = await bookModel.findById(bookId);
    if (!book) {
      throw new Error('Livro não encontrado');
    }

    // Verificar se o livro pode ser salvo
    if (book.status === 'archived') {
      throw new Error('Não é possível salvar livros arquivados');
    }

    // Livros privados só podem ser salvos pelo próprio autor
    if (book.visibility === 'private' && book.author_id !== userId) {
      throw new Error('Livro não encontrado');
    }

    // Adicionar à biblioteca (operação idempotente)
    const result = await libraryModel.addToLibrary(userId, bookId);
    
    return {
      id: result.id,
      book_id: bookId,
      added_at: result.created_at,
      message: 'Livro adicionado à biblioteca'
    };
  }

  async removeBookFromLibrary(userId, bookId) {
    const removed = await libraryModel.removeFromLibrary(userId, bookId);
    
    if (!removed) {
      throw new Error('Livro não estava na biblioteca');
    }

    return { message: 'Livro removido da biblioteca' };
  }

  async getUserLibrary(userId, limit = 20, offset = 0) {
    const books = await libraryModel.getUserLibrary(userId, limit, offset);
    
    return {
      books,
      pagination: {
        limit,
        offset,
        total: books.length
      }
    };
  }

  async isBookInUserLibrary(userId, bookId) {
    return await libraryModel.isBookInLibrary(userId, bookId);
  }

  // Licenças offline
  async createOfflineLicense(userId, bookId, deviceId) {
    // Verificar se o livro existe e está acessível
    const book = await bookModel.findById(bookId);
    if (!book) {
      throw new Error('Livro não encontrado');
    }

    // Verificar acesso ao livro
    const canAccess = this._canUserAccessBook(book, userId);
    if (!canAccess) {
      throw new Error('Livro não encontrado');
    }

    if (book.status === 'archived') {
      throw new Error('Não é possível baixar livros arquivados');
    }

    // Verificar se já existe licença ativa
    const existingLicense = await libraryModel.getOfflineLicense(userId, deviceId, bookId);
    if (existingLicense) {
      // Retornar licença existente com URLs atualizadas
      const manifest = await libraryModel.getOrCreateManifest(bookId);
      return this._formatLicenseResponse(existingLicense, manifest, false);
    }

    // Gerar nova licença
    const contentKey = encryptionUtils.generateContentKey();
    const deviceSecret = encryptionUtils.deriveDeviceSecret(userId, deviceId);
    const contentKeyWrapped = encryptionUtils.wrapContentKey(contentKey, deviceSecret);

    // Definir expiração (30 dias)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Criar licença
    const license = await libraryModel.createOfflineLicense({
      user_id: userId,
      book_id: bookId,
      device_id: deviceId,
      content_key_wrapped: contentKeyWrapped,
      license_expires_at: expiresAt
    });

    // Obter ou criar manifesto no banco
    let manifest = await libraryModel.getOrCreateManifest(bookId);

    // Criar pacote no Supabase Storage se ainda não existe
    const packageInfo = await supabaseStorageService.createOfflinePackage(bookId, contentKey);

    // Atualizar metadados do manifesto
    if (manifest.checksum === 'pending') {
      manifest = await libraryModel.updateManifestMetadata(
        manifest.id,
        packageInfo.package_size,
        packageInfo.checksum
      );
    }

    console.log(`Licença offline criada: user=${userId}, book=${bookId}, device=${deviceId}, license=${license.id}`);

    return {
      message: 'Licença offline criada',
      data: {
        license: {
          id: license.id,
          book_id: license.book_id,
          user_id: license.user_id,
          device_id: license.device_id,
          status: license.status,
          content_key_wrapped: license.content_key_wrapped,
          license_expires_at: license.license_expires_at
        },
        manifest: {
          version: manifest.version,
          manifest_url: packageInfo.manifest_url,
          package_url: packageInfo.package_url,
          package_size: packageInfo.package_size,
          checksum: packageInfo.checksum
        }
      }
    };
  }

  async _formatLicenseResponse(license, manifest, isNew = false) {
    const manifestUrl = await supabaseStorageService.createSignedUrl(manifest.manifest_path, 900);
    const packageUrl = await supabaseStorageService.createSignedUrl(manifest.package_path, 900);

    return {
      message: isNew ? 'Licença offline criada' : 'Licença offline existente',
      data: {
        license: {
          id: license.id,
          book_id: license.book_id,
          user_id: license.user_id,
          device_id: license.device_id,
          status: license.status,
          content_key_wrapped: license.content_key_wrapped,
          license_expires_at: license.license_expires_at
        },
        manifest: {
          version: manifest.version,
          manifest_url: manifestUrl,
          package_url: packageUrl,
          package_size: manifest.package_size,
          checksum: manifest.checksum
        }
      }
    };
  }



  async revokeOfflineLicense(userId, bookId, deviceId) {
    if (!deviceId) {
      throw new Error('Device ID é obrigatório');
    }

    const revoked = await libraryModel.revokeOfflineLicense(userId, deviceId, bookId);
    
    if (!revoked) {
      throw new Error('Licença não encontrada ou já revogada');
    }

    // Log para auditoria
    console.log(`Licença offline revogada: user=${userId}, book=${bookId}, device=${deviceId}`);

    return { message: 'Licença offline revogada' };
  }

  async getUserOfflineLicenses(userId, deviceId = null) {
    const licenses = await libraryModel.getUserOfflineLicenses(userId, deviceId);
    
    return {
      licenses: licenses.map(license => ({
        license_id: license.id,
        book: {
          id: license.books.id,
          title: license.books.title,
          cover_url: license.books.cover_url,
          status: license.books.status,
          words_count: license.books.words_count,
          chapters_count: license.books.chapters_count
        },
        device_id: license.device_id,
        expires_at: license.license_expires_at,
        created_at: license.created_at
      })),
      total: licenses.length
    };
  }

  async renewOfflineLicense(userId, bookId, deviceId) {
    if (!deviceId) {
      throw new Error('Device ID é obrigatório');
    }

    // Verificar se a licença existe e está ativa
    const existingLicense = await libraryModel.getOfflineLicense(userId, deviceId, bookId);
    if (!existingLicense) {
      throw new Error('Licença não encontrada');
    }

    // Verificar se o livro ainda está acessível
    const book = await bookModel.findById(bookId);
    if (!book || !this._canUserAccessBook(book, userId)) {
      throw new Error('Livro não encontrado');
    }

    // Nova data de expiração (+30 dias)
    const newExpiryDate = new Date();
    newExpiryDate.setDate(newExpiryDate.getDate() + 30);

    // Renovar licença
    const renewedLicense = await libraryModel.renewOfflineLicense(
      userId, 
      deviceId, 
      bookId, 
      newExpiryDate
    );

    // Log para auditoria
    console.log(`Licença offline renovada: user=${userId}, book=${bookId}, device=${deviceId}, license=${renewedLicense.id}`);

    return {
      license_id: renewedLicense.id,
      expires_at: renewedLicense.license_expires_at,
      message: 'Licença renovada com sucesso'
    };
  }

  async countActiveOfflineLicenses(userId, deviceId = null) {
    return await libraryModel.countActiveOfflineLicenses(userId, deviceId);
  }

  // Métodos privados de apoio
  _canUserAccessBook(book, userId) {
    // Autor sempre pode acessar seus próprios livros
    if (book.author_id === userId) {
      return true;
    }

    // Outros usuários só podem acessar livros publicados e públicos
    return book.status === 'published' && book.visibility === 'public';
  }

  _formatLicenseResponse(license, manifest, isNew = false) {
    // Gerar signed URLs com expiração curta
    const manifestUrl = encryptionUtils.generateSignedUrl(manifest.manifest_path, 15);
    const packageUrl = encryptionUtils.generateSignedUrl(manifest.package_path, 15);

    return {
      message: isNew ? 'Licença offline criada' : 'Licença offline existente',
      data: {
        license: {
          id: license.id,
          book_id: license.book_id,
          user_id: license.user_id,
          device_id: license.device_id,
          status: license.status,
          content_key_wrapped: license.content_key_wrapped,
          license_expires_at: license.license_expires_at
        },
        manifest: {
          version: manifest.version,
          manifest_url: manifestUrl,
          package_url: packageUrl,
          package_size: manifest.package_size,
          checksum: manifest.checksum
        }
      }
    };
  }

  // Tarefas de manutenção
  async cleanupExpiredLicenses() {
    return await libraryModel.cleanupExpiredLicenses();
  }
}

module.exports = new LibraryService();