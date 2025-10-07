// types/auth.types.ts
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  interests?: string[];
  upload_folder?: string;
  profile_completed?: boolean;
  created_at: string;
  updated_at: string;
}

export interface SignUpData {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface ForgotPasswordData {
  email?: string;
  phoneNumber?: string;
  method: 'email' | 'sms';
}

export interface VerificationData {
  code: string;
}

export interface ResetPasswordData {
  password: string;
  confirmPassword: string;
}

export interface UpdateProfileData {
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  interests?: string[];
  profile_completed?: boolean;
}

export interface CreateProfileData {
  full_name: string;
  bio?: string;
  interests: string[];
  avatar_file?: {
    uri: string;
    name: string;
    type: string;
  };
}

export type SocialProvider = 'google' | 'facebook' | 'twitter';

export interface SocialAuthResult {
  user: User;
  isNewUser: boolean;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (data: SignInData) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithSocial: (provider: SocialProvider, token: string) => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
}

export const LITERARY_INTERESTS = [
  { id: 'romance', label: 'Romance', icon: '💕' },
  { id: 'fantasy', label: 'Fantasia', icon: '🐉' },
  { id: 'scifi', label: 'Ficção Científica', icon: '🚀' },
  { id: 'mystery', label: 'Mistério', icon: '🔍' },
  { id: 'thriller', label: 'Suspense', icon: '😱' },
  { id: 'horror', label: 'Terror', icon: '👻' },
  { id: 'adventure', label: 'Aventura', icon: '⚔️' },
  { id: 'drama', label: 'Drama', icon: '🎭' },
  { id: 'poetry', label: 'Poesia', icon: '📜' },
  { id: 'biography', label: 'Biografia', icon: '👤' },
  { id: 'history', label: 'História', icon: '📚' },
  { id: 'selfhelp', label: 'Autoajuda', icon: '💪' },
] as const;