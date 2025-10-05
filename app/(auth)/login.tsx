// app/(auth)/login.tsx
import { Button } from '@/components/forms/button';
import { Input } from '@/components/forms/input';
import { SocialButton } from '@/components/forms/social-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/contexts/auth.context';
import { useGoogleAuth } from '@/hooks/use-google-auth';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signInWithSocial } = useAuth();
  const { request, response, promptAsync } = useGoogleAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'twitter' | 'facebook' | null>(null);

  // Processar resposta do Google
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.idToken) {
        handleGoogleSuccess(authentication.idToken);
      }
    } else if (response?.type === 'error') {
      setSocialLoading(null);
      Alert.alert('Erro', 'Não foi possível fazer login com Google');
    } else if (response?.type === 'cancel') {
      setSocialLoading(null);
    }
  }, [response]);

  const handleGoogleSuccess = async (token: string) => {
    try {
      await signInWithSocial('google', token);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Erro no login', error.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setSocialLoading(null);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await signIn({ email, password });
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Erro ao entrar', error.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'twitter' | 'facebook') => {
    if (provider === 'google') {
      setSocialLoading('google');
      try {
        await promptAsync();
      } catch (error) {
        setSocialLoading(null);
        Alert.alert('Erro', 'Não foi possível iniciar o login com Google');
      }
    } else {
      Alert.alert('Em breve', `Login com ${provider} será implementado em breve.`);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <ThemedText style={styles.title}>Bem-vindo de volta!</ThemedText>
            </View>

            <View style={styles.form}>
              <Input
                label="Email"
                placeholder="Digite seu email"
                value={email}
                onChangeText={setEmail}
                error={errors.email}
                leftIcon="envelope.fill"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading && !socialLoading}
              />

              <Input
                label="Senha"
                placeholder="Digite sua senha"
                value={password}
                onChangeText={setPassword}
                error={errors.password}
                leftIcon="lock.fill"
                secureTextEntry
                editable={!loading && !socialLoading}
              />

              <TouchableOpacity
                onPress={() => router.push('/(auth)/forgot-password')}
                style={styles.forgotPassword}
                disabled={loading || !!socialLoading}>
                <ThemedText style={styles.forgotPasswordText}>Esqueceu a senha?</ThemedText>
              </TouchableOpacity>

              <Button 
                title="Entrar" 
                onPress={handleSignIn} 
                loading={loading}
                disabled={!!socialLoading}
              />
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <ThemedText style={styles.dividerText}>Ou entre com</ThemedText>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtons}>
              <SocialButton 
                provider="google" 
                onPress={() => handleSocialSignIn('google')}
                disabled={loading || !!socialLoading || !request}
                loading={socialLoading === 'google'}
              />
              <SocialButton 
                provider="twitter" 
                onPress={() => handleSocialSignIn('twitter')}
                disabled={loading || !!socialLoading}
                loading={socialLoading === 'twitter'}
              />
              <SocialButton 
                provider="facebook" 
                onPress={() => handleSocialSignIn('facebook')}
                disabled={loading || !!socialLoading}
                loading={socialLoading === 'facebook'}
              />
            </View>

            <View style={styles.footer}>
              <ThemedText style={styles.footerText}>Não tem uma conta? </ThemedText>
              <TouchableOpacity 
                onPress={() => router.push('/(auth)/register')}
                disabled={loading || !!socialLoading}>
                <ThemedText style={styles.footerLink}>Cadastre-se</ThemedText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h1,
    fontWeight: '700',
  },
  form: {
    marginBottom: Spacing.lg,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.lg,
  },
  forgotPasswordText: {
    ...Typography.body,
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    ...Typography.body,
    marginHorizontal: Spacing.md,
    opacity: 0.6,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    ...Typography.body,
    opacity: 0.7,
  },
  footerLink: {
    ...Typography.body,
    fontWeight: '600',
  },
});