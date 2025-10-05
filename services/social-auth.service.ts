// services/social-auth.service.ts
import { User } from '@/types/auth.types';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import {
    signOut as firebaseSignOut,
    GoogleAuthProvider,
    signInWithCredential,
} from 'firebase/auth';
import { auth } from './firebase';
import { supabase } from './supabase';

// Necessário para o redirect funcionar no Android/iOS
WebBrowser.maybeCompleteAuthSession();

export class SocialAuthService {
  /**
   * Configuração do Google Auth Request
   */
  static useGoogleAuth() {
    return Google.useAuthRequest({
      expoClientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      scopes: ['profile', 'email'],
    });
  }

  /**
   * Realiza login com Google usando o token de resposta
   */
  static async signInWithGoogle(token: string): Promise<User> {
    try {
      if (!auth) {
        throw new Error('Firebase não está inicializado');
      }

      // 1. Criar credencial do Google
      const credential = GoogleAuthProvider.credential(token);

      // 2. Autenticar no Firebase
      const firebaseUserCredential = await signInWithCredential(auth, credential);
      const firebaseUser = firebaseUserCredential.user;

      if (!firebaseUser || !firebaseUser.email) {
        throw new Error('Não foi possível obter os dados do usuário');
      }

      // 3. Obter token do Firebase para usar no Supabase
      const firebaseToken = await firebaseUser.getIdToken();

      // 4. Verificar se o usuário já existe no Supabase
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', firebaseUser.email)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      let profile: User;

      if (existingProfile) {
        // Usuário já existe, atualizar dados se necessário
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({
            full_name: firebaseUser.displayName || existingProfile.full_name,
            avatar_url: firebaseUser.photoURL || existingProfile.avatar_url,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingProfile.id)
          .select()
          .single();

        if (updateError) throw updateError;
        profile = updatedProfile;
      } else {
        // Criar novo usuário no Supabase Auth
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: firebaseUser.email,
          password: firebaseToken.substring(0, 32), // Usar parte do token como senha
          options: {
            data: {
              full_name: firebaseUser.displayName || '',
              avatar_url: firebaseUser.photoURL || '',
              provider: 'google',
              firebase_uid: firebaseUser.uid,
            },
          },
        });

        if (signUpError) {
          // Se o usuário já existe no Supabase Auth mas não na tabela profiles
          if (signUpError.message.includes('already registered')) {
            // Fazer login normal
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: firebaseUser.email,
              password: firebaseToken.substring(0, 32),
            });

            if (signInError) {
              // Se falhar, criar com senha aleatória
              const randomPassword = firebaseToken.substring(0, 32);
              const { error: signUpRetryError } = await supabase.auth.signUp({
                email: firebaseUser.email,
                password: randomPassword,
              });

              if (signUpRetryError) throw signUpRetryError;
            }

            // Buscar ou criar perfil
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('email', firebaseUser.email)
              .maybeSingle();

            if (profileError && profileError.code !== 'PGRST116') throw profileError;

            if (!profileData) {
              // Buscar ID do usuário no Supabase Auth
              const { data: { user: supabaseUser } } = await supabase.auth.getUser();
              
              if (supabaseUser) {
                // Criar perfil manualmente
                const { data: newProfile, error: createError } = await supabase
                  .from('profiles')
                  .insert({
                    id: supabaseUser.id,
                    email: firebaseUser.email,
                    full_name: firebaseUser.displayName || '',
                    avatar_url: firebaseUser.photoURL || '',
                  })
                  .select()
                  .single();

                if (createError) throw createError;
                profile = newProfile;
              } else {
                throw new Error('Não foi possível criar perfil');
              }
            } else {
              profile = profileData;
            }
          } else {
            throw signUpError;
          }
        } else {
          // Buscar o perfil criado
          if (!authData.user) throw new Error('Falha ao criar usuário');

          const { data: newProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          if (profileError) throw profileError;
          profile = newProfile;
        }
      }

      return profile;
    } catch (error: any) {
      console.error('Erro no login social:', error);
      throw error;
    }
  }

  /**
   * Desconecta do Firebase
   */
  static async signOut(): Promise<void> {
    try {
      if (auth) {
        await firebaseSignOut(auth);
      }
    } catch (error) {
      console.error('Erro ao desconectar do Firebase:', error);
    }
  }
}