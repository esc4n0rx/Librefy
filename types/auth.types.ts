// types/auth.types.ts
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
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
}