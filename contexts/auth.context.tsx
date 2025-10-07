// contexts/auth.context.tsx
import { AuthService } from '@/services/auth.service';
import { ProfileService } from '@/services/profile.service';
import { SocialAuthService } from '@/services/social-auth.service';
import { supabase } from '@/services/supabase';
import {
  AuthContextType,
  SignInData,
  SignUpData,
  SocialProvider,
  UpdateProfileData,
  User,
} from '@/types/auth.types';
import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão inicial
    AuthService.getCurrentUser()
      .then(setUser)
      .catch(console.error)
      .finally(() => setLoading(false));

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const profile = await AuthService.getCurrentUser();
          setUser(profile);
        } catch (error) {
          console.error('Erro ao buscar perfil:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (data: SignInData) => {
    setLoading(true);
    try {
      const profile = await AuthService.signIn(data);
      setUser(profile);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (data: SignUpData) => {
    setLoading(true);
    try {
      const profile = await AuthService.signUp(data);
      setUser(profile);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await SocialAuthService.signOut();
      await AuthService.signOut();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    await AuthService.resetPassword(email);
  };

  const signInWithSocial = async (provider: SocialProvider, token: string) => {
    setLoading(true);
    try {
      let profile: User;

      switch (provider) {
        case 'google':
          profile = await SocialAuthService.signInWithGoogle(token);
          break;
        case 'facebook':
          throw new Error('Login com Facebook será implementado em breve');
        case 'twitter':
          throw new Error('Login com Twitter será implementado em breve');
        default:
          throw new Error('Provedor não suportado');
      }

      setUser(profile);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: UpdateProfileData) => {
    if (!user) throw new Error('Usuário não autenticado');

    setLoading(true);
    try {
      const updatedProfile = await ProfileService.updateProfile(user.id, data);
      setUser(updatedProfile);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        signInWithSocial,
        updateProfile,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}