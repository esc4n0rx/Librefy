const { supabaseAdmin } = require('../config/database');
const encryptionUtils = require('../utils/encryption-utils');
const bookModel = require('../models/book-model');
const chapterModel = require('../models/chapter-model');

class SupabaseStorageService {
  
  constructor() {
    this.bucketName = 'librefy';
  }

  // Gerar manifesto JSON do livro
  async generateBookManifest(bookId) {
    const book = await bookModel.findById(bookId, true);
    if (!book) {
      throw new Error('Livro não encontrado');
    }

    // Filtrar apenas capítulos publicados
    const publishedChapters = book.chapters?.filter(c => c.is_published) || [];

    const manifest = {
      version: 1,
      book: {
        id: book.id,
        title: book.title,
        description: book.description,
        author: book.users?.name || 'Autor Desconhecido',
        cover_url: book.cover_url,
        tags: book.tags,
        created_at: book.created_at,
        updated_at: book.updated_at
      },
      chapters: publishedChapters.map(chapter => ({
        id: chapter.id,
        number: chapter.chapter_number,
        title: chapter.title,
        words_count: chapter.words_count,
        created_at: chapter.created_at,
        updated_at: chapter.updated_at
      })),
      metadata: {
        total_chapters: publishedChapters.length,
        total_words: publishedChapters.reduce((sum, ch) => sum + (ch.words_count || 0), 0),
        generated_at: new Date().toISOString()
      }
    };

    return manifest;
  }

  // Gerar pacote de conteúdo criptografado
  async generateBookPackage(bookId, contentKey) {
    const book = await bookModel.findById(bookId, true);
    if (!book) {
      throw new Error('Livro não encontrado');
    }

    // Filtrar apenas capítulos publicados
    const publishedChapters = book.chapters?.filter(c => c.is_published) || [];

    const packageData = {
      book_metadata: {
        id: book.id,
        title: book.title,
        description: book.description
      },
      chapters: publishedChapters.map(chapter => ({
        id: chapter.id,
        number: chapter.chapter_number,
        title: chapter.title,
        content_md: chapter.content_md,
        words_count: chapter.words_count
      }))
    };

    // Converter para JSON e criptografar
    const jsonContent = JSON.stringify(packageData);
    const encryptedContent = encryptionUtils.encryptContent(jsonContent, contentKey);

    return encryptedContent;
  }

  // Upload de arquivo para o Supabase Storage
  async uploadFile(filePath, fileBuffer, contentType = 'application/json') {
    try {
      const { data, error } = await supabaseAdmin.storage
        .from(this.bucketName)
        .upload(filePath, fileBuffer, {
          contentType,
          cacheControl: '3600', // Cache por 1 hora
          upsert: true // Substituir se já existir
        });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      throw new Error(`Falha no upload: ${error.message}`);
    }
  }

  // Gerar signed URL com expiração
  async createSignedUrl(filePath, expiresInSeconds = 900) { // 15 minutos
    try {
      const { data, error } = await supabaseAdmin.storage
        .from(this.bucketName)
        .createSignedUrl(filePath, expiresInSeconds);

      if (error) {
        throw error;
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Erro ao gerar signed URL:', error);
      throw new Error(`Falha ao gerar URL: ${error.message}`);
    }
  }

  // Criar ou atualizar manifesto e pacote no storage
  async createOfflinePackage(bookId, contentKey) {
    try {
      // 1. Gerar manifesto
      const manifest = await this.generateBookManifest(bookId);
      const manifestJson = JSON.stringify(manifest, null, 2);
      const manifestBuffer = Buffer.from(manifestJson, 'utf-8');

      // 2. Gerar pacote criptografado
      const encryptedPackage = await this.generateBookPackage(bookId, contentKey);

      // 3. Definir paths no storage
      const manifestPath = `manifests/${bookId}/v1/manifest.json`;
      const packagePath = `packages/${bookId}/v1/content.enc`;

      // 4. Upload do manifesto
      await this.uploadFile(manifestPath, manifestBuffer, 'application/json');

      // 5. Upload do pacote criptografado
      await this.uploadFile(packagePath, encryptedPackage, 'application/octet-stream');

      // 6. Gerar signed URLs
      const manifestUrl = await this.createSignedUrl(manifestPath);
      const packageUrl = await this.createSignedUrl(packagePath);

      // 7. Calcular metadados
      const packageSize = encryptedPackage.length;
      const checksum = encryptionUtils.generateChecksum(encryptedPackage);

      return {
        manifest_path: manifestPath,
        package_path: packagePath,
        manifest_url: manifestUrl,
        package_url: packageUrl,
        package_size: packageSize,
        checksum: checksum
      };

    } catch (error) {
      console.error('Erro ao criar pacote offline:', error);
      throw error;
    }
  }

  // Verificar se arquivo existe no storage
  async fileExists(filePath) {
    try {
      const { data, error } = await supabaseAdmin.storage
        .from(this.bucketName)
        .list(filePath.split('/').slice(0, -1).join('/'), {
          limit: 1,
          search: filePath.split('/').pop()
        });

      return !error && data && data.length > 0;
    } catch (error) {
      return false;
    }
  }

  // Deletar arquivo do storage
  async deleteFile(filePath) {
    try {
      const { error } = await supabaseAdmin.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        console.error('Erro ao deletar arquivo:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      return false;
    }
  }

  // Limpeza de arquivos antigos (chamado periodicamente)
  async cleanupOldFiles(olderThanDays = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      // Listar arquivos antigos (isso é uma simplificação - implementar lógica mais robusta em produção)
      console.log(`Limpeza de arquivos anteriores a ${cutoffDate.toISOString()}`);

      // Implementar lógica de limpeza baseada em metadados ou logs
      return true;
    } catch (error) {
      console.error('Erro na limpeza de arquivos:', error);
      return false;
    }
  }
}

module.exports = new SupabaseStorageService();