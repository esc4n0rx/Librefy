// hooks/use-google-auth.ts
import { SocialAuthService } from '@/services/social-auth.service';
import { useEffect } from 'react';

export function useGoogleAuth() {
  const [request, response, promptAsync] = SocialAuthService.useGoogleAuth();

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      // O token será processado no componente que usa este hook
    }
  }, [response]);

  return {
    request,
    response,
    promptAsync,
  };
}