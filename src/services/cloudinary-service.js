const cloudinary = require('../config/cloudinary');

class CloudinaryService {
  
  async uploadBookCover(fileBuffer, bookId) {
    try {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'librefy/covers',
            public_id: `cover_${bookId}`,
            format: 'webp',
            transformation: [
              { width: 400, height: 600, crop: 'fill' },
              { quality: 'auto:good' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        
        uploadStream.end(fileBuffer);
      });
    } catch (error) {
      throw new Error(`Erro ao fazer upload da capa: ${error.message}`);
    }
  }

  async deleteBookCover(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      console.error('Erro ao deletar capa:', error);
      // Não falhar se não conseguir deletar
      return null;
    }
  }

  extractPublicIdFromUrl(cloudinaryUrl) {
    if (!cloudinaryUrl) return null;
    
    // Extrair public_id da URL do Cloudinary
    // Exemplo: https://res.cloudinary.com/cloud/image/upload/v123/librefy/covers/cover_abc.webp
    const matches = cloudinaryUrl.match(/\/librefy\/covers\/([^\/\.]+)/);
    return matches ? `librefy/covers/${matches[1]}` : null;
  }
}

module.exports = new CloudinaryService();