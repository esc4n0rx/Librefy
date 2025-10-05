// app/(auth)/reset-password.tsx
import { Button } from '@/components/forms/button';
import { Input } from '@/components/forms/input';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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

export default function ResetPasswordScreen() {
  const router = useRouter();
  const iconColor = useThemeColor({}, 'icon');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  const validatePassword = (pwd: string): string[] => {
    const validations: string[] = [];
    if (!/[A-Z]/.test(pwd)) validations.push('letra maiúscula');
    if (!/[a-z]/.test(pwd)) validations.push('letra minúscula');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) validations.push('símbolo');
    if (!/\d/.test(pwd)) validations.push('número');
    return validations;
  };

  const validateForm = (): boolean => {
    const newErrors: {
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 8) {
      newErrors.password = 'Senha deve ter no mínimo 8 caracteres';
    } else {
      const missing = validatePassword(password);
      if (missing.length > 0) {
        newErrors.password = `Deve conter ${missing.join(', ')}`;
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirme sua senha';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    setLoading(true);
    // Simulação - Lógica será implementada depois
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Sucesso!',
        'Sua senha foi redefinida com sucesso.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      );
    }, 1500);
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
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <IconSymbol name="chevron.left" size={24} color={iconColor} />
            </TouchableOpacity>

            <View style={styles.header}>
              <ThemedText style={styles.title}>Criar nova senha</ThemedText>
              <ThemedText style={styles.subtitle}>
                Sua nova senha deve ser diferente das senhas usadas anteriormente.
              </ThemedText>
            </View>

            <View style={styles.form}>
              <Input
                label="Senha"
                placeholder="••••••••••••"
                value={password}
                onChangeText={setPassword}
                error={errors.password}
                leftIcon="lock.fill"
                secureTextEntry
              />
              {password.length > 0 && !errors.password && (
                <ThemedText style={styles.helperText}>
                  Deve conter letra maiúscula e minúscula, símbolos e números
                </ThemedText>
              )}

              <Input
                label="Confirmar Senha"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                error={errors.confirmPassword}
                leftIcon="lock.fill"
                secureTextEntry
              />
              {confirmPassword.length > 0 && !errors.confirmPassword && (
                <ThemedText style={styles.helperText}>
                  Ambas as senhas devem ser iguais
                </ThemedText>
              )}

              <Button
                title="Redefinir Senha"
                onPress={handleResetPassword}
                loading={loading}
              />
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
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    opacity: 0.7,
  },
  form: {
    gap: Spacing.xs,
  },
  helperText: {
    ...Typography.small,
    opacity: 0.6,
    marginTop: -Spacing.sm,
    marginBottom: Spacing.sm,
  },
});