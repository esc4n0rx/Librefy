// app/(auth)/register.tsx
import { Button } from '@/components/forms/button';
import { Input } from '@/components/forms/input';
import { SocialButton } from '@/components/forms/social-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/contexts/auth.context';
import { useGoogleAuth } from '@/hooks/use-google-auth';
import { useThemeColor } from '@/hooks/use-theme-color';
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

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp, signInWithSocial } = useAuth();
  const { request, response, promptAsync } = useGoogleAuth();
  const iconColor = useThemeColor({}, 'icon');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
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
      Alert.alert('Erro', 'Não foi possível fazer cadastro com Google');
    } else if (response?.type === 'cancel') {
      setSocialLoading(null);
    }
  }, [response]);

  const handleGoogleSuccess = async (token: string) => {
    try {
      await signInWithSocial('google', token);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Erro no cadastro', error.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setSocialLoading(null);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

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

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirme sua senha';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await signUp({ email, password, confirmPassword });
      Alert.alert(
        'Sucesso!',
        'Conta criada com sucesso. Verifique seu email para confirmar.',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
      );
    } catch (error: any) {
      Alert.alert('Erro ao cadastrar', error.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignUp = async (provider: 'google' | 'twitter' | 'facebook') => {
    if (provider === 'google') {
      setSocialLoading('google');
      try {
        await promptAsync();
      } catch (error) {
        setSocialLoading(null);
        Alert.alert('Erro', 'Não foi possível iniciar o cadastro com Google');
      }
    } else {
      Alert.alert('Em breve', `Cadastro com ${provider} será implementado em breve.`);
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
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              disabled={loading || !!socialLoading}>
              <IconSymbol name="chevron.left" size={24} color={iconColor} />
            </TouchableOpacity>

            <View style={styles.header}>
              <ThemedText style={styles.title}>Criar Conta</ThemedText>
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

              <Input
                label="Confirmar Senha"
                placeholder="Digite sua senha novamente"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                error={errors.confirmPassword}
                leftIcon="lock.fill"
                secureTextEntry
                editable={!loading && !socialLoading}
              />

              <Button 
                title="Cadastrar" 
                onPress={handleSignUp} 
                loading={loading}
                disabled={!!socialLoading}
              />
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
               <ThemedText style={styles.dividerText}>Ou cadastre-se com</ThemedText>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtons}>
              <SocialButton 
                provider="google" 
                onPress={() => handleSocialSignUp('google')}
                disabled={loading || !!socialLoading || !request}
                loading={socialLoading === 'google'}
              />
              <SocialButton 
                provider="twitter" 
                onPress={() => handleSocialSignUp('twitter')}
                disabled={loading || !!socialLoading}
                loading={socialLoading === 'twitter'}
              />
              <SocialButton 
                provider="facebook" 
                onPress={() => handleSocialSignUp('facebook')}
                disabled={loading || !!socialLoading}
                loading={socialLoading === 'facebook'}
              />
            </View>

            <View style={styles.footer}>
              <ThemedText style={styles.footerText}>Já tem uma conta? </ThemedText>
              <TouchableOpacity 
                onPress={() => router.back()}
                disabled={loading || !!socialLoading}>
                <ThemedText style={styles.footerLink}>Entrar</ThemedText>
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
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  backButton: {
    marginBottom: Spacing.md,
    padding: Spacing.xs,
    alignSelf: 'flex-start',
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