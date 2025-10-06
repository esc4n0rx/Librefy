// hooks/use-image-auth.tsx

import { useEffect, useState } from 'react';

const UPLOAD_API_TOKEN = process.env.EXPO_PUBLIC_UPLOAD_API_KEY || '';

interface UseImageAuthOptions {
  enabled?: boolean;
}

export function useImageAuth(url: string | null | undefined, options: UseImageAuthOptions = {}) {
  const { enabled = true } = options;
  const [authenticatedUrl, setAuthenticatedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!url || !enabled) {
      setAuthenticatedUrl(null);
      return;
    }

    // Se não for uma URL da API de upload, retornar como está
    if (!url.includes('api.poupadin.space/files/')) {
      setAuthenticatedUrl(url);
      return;
    }

    const fetchAuthenticatedImage = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${UPLOAD_API_TOKEN}`,
          },
        });

        if (!response.ok) {
          throw new Error('Falha ao carregar imagem');
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setAuthenticatedUrl(objectUrl);
      } catch (err) {
        setError(err as Error);
        setAuthenticatedUrl(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthenticatedImage();

    // Cleanup: revogar URL do objeto quando o componente desmontar
    return () => {
      if (authenticatedUrl && authenticatedUrl.startsWith('blob:')) {
        URL.revokeObjectURL(authenticatedUrl);
      }
    };
  }, [url, enabled]);

  return { authenticatedUrl, loading, error };
}