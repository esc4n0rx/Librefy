// services/profile.service.ts
import { CreateProfileData, UpdateProfileData, User } from '@/types/auth.types';
import { supabase } from './supabase';
import { UploadService } from './upload.service';

export class ProfileService {
  /**
   * Gera um nome de pasta único para o usuário
   */
  static generateUserFolder(userId: string): string {
    return `user-${userId}`;
  }

  /**
   * Completa o perfil do usuário após o registro
   */
  static async completeProfile(
    userId: string,
    profileData: CreateProfileData
  ): Promise<User> {
    try {
      const folderName = this.generateUserFolder(userId);
      let avatarUrl: string | undefined;

      // 1. Criar pasta do usuário
      await UploadService.createFolder(folderName);

      // 2. Upload do avatar se fornecido
      if (profileData.avatar_file) {
        const uploadedFiles = await UploadService.uploadFiles(folderName, [
          profileData.avatar_file,
        ]);

        if (uploadedFiles[0]) {
          avatarUrl = UploadService.getFileUrl(folderName, uploadedFiles[0]);
        }
      }

      // 3. Atualizar perfil no banco
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          bio: profileData.bio,
          avatar_url: avatarUrl,
          interests: profileData.interests,
          upload_folder: folderName,
          profile_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Erro ao completar perfil:', error);
      throw error;
    }
  }

  /**
   * Atualiza o perfil do usuário
   */
  static async updateProfile(
    userId: string,
    updates: UpdateProfileData
  ): Promise<User> {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  /**
   * Atualiza o avatar do usuário
   */
  static async updateAvatar(
    userId: string,
    avatarFile: { uri: string; name: string; type: string }
  ): Promise<string> {
    try {
      // Buscar perfil para pegar folder e avatar antigo
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('upload_folder, avatar_url')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;

      let folderName = profile.upload_folder;

      // Se não tiver pasta, criar
      if (!folderName) {
        folderName = this.generateUserFolder(userId);
        await UploadService.createFolder(folderName);
      }

      // Deletar avatar antigo se existir
      if (profile.avatar_url) {
        try {
          const oldFilename = profile.avatar_url.split('/').pop();
          if (oldFilename) {
            await UploadService.deleteFile(folderName, oldFilename);
          }
        } catch (error) {
          console.warn('Erro ao deletar avatar antigo:', error);
        }
      }

      // Upload novo avatar
      const uploadedFiles = await UploadService.uploadFiles(folderName, [avatarFile]);

      if (!uploadedFiles[0]) {
        throw new Error('Falha no upload do avatar');
      }

      const avatarUrl = UploadService.getFileUrl(folderName, uploadedFiles[0]);

      // Atualizar no banco
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: avatarUrl,
          upload_folder: folderName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      return avatarUrl;
    } catch (error) {
      console.error('Erro ao atualizar avatar:', error);
      throw error;
    }
  }

  /**
   * Busca o perfil completo do usuário
   */
  static async getProfile(userId: string): Promise<User> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return data;
  }

  /**
   * Verifica se o perfil está completo
   */
  static async isProfileCompleted(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('profiles')
      .select('profile_completed')
      .eq('id', userId)
      .single();

    if (error) return false;

    return data?.profile_completed || false;
  }
}