// services/upload.service.ts

const API_BASE_URL = 'https://api.poupadin.space';
const API_KEY = process.env.EXPO_PUBLIC_UPLOAD_API_KEY || '';

export class UploadService {
  /**
   * Cria uma pasta na API de upload
   */
  static async createFolder(folderName: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/folder`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: folderName }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao criar pasta');
    }
  }

  /**
   * Faz upload de arquivos para uma pasta
   */
  static async uploadFiles(
    folderName: string,
    files: { uri: string; name: string; type: string }[]
  ): Promise<string[]> {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append('files', {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);
    });

    const response = await fetch(`${API_BASE_URL}/upload/${folderName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao fazer upload');
    }

    const data = await response.json();
    return data.files || [];
  }

  /**
   * Deleta um arquivo
   */
  static async deleteFile(folderName: string, filename: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/files/${folderName}/${filename}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao deletar arquivo');
    }
  }

  /**
   * Retorna a URL completa para acessar um arquivo
   */
  static getFileUrl(folderName: string, filename: string): string {
    return `${API_BASE_URL}/files/${folderName}/${filename}`;
  }

  /**
   * Gera um nome de pasta único para um livro
   */
  static generateFolderName(bookTitle: string): string {
    const sanitized = bookTitle
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 30);
    
    const random = Math.random().toString(36).substring(2, 8);
    return `${sanitized}-${random}`;
  }
}