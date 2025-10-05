// services/auth.service.ts
import { SignInData, SignUpData, User } from '@/types/auth.types';
import { supabase } from './supabase';

export class AuthService {
  /**
   * Registra um novo usuário
   */
  static async signUp(data: SignUpData): Promise<User> {
    const { email, password } = data;

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: '',
        },
      },
    });

    if (signUpError) throw signUpError;
    if (!authData.user) throw new Error('Falha ao criar usuário');

    // Buscar perfil criado automaticamente pelo trigger
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) throw profileError;

    return profile;
  }

  /**
   * Realiza login
   */
  static async signIn(data: SignInData): Promise<User> {
    const { email, password } = data;

    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) throw signInError;
    if (!authData.user) throw new Error('Falha ao fazer login');

    // Buscar perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) throw profileError;

    return profile;
  }

  /**
   * Realiza logout
   */
  static async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  /**
   * Envia email de recuperação de senha
   */
  static async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'librefy://reset-password',
    });

    if (error) throw error;
  }

  /**
   * Obtém usuário atual
   */
  static async getCurrentUser(): Promise<User | null> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) throw error;

    return profile;
  }

  /**
   * Atualiza perfil do usuário
   */
  static async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return data;
  }
}