// app/(auth)/forgot-password.tsx
import { Button } from '@/components/forms/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
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

type RecoveryMethod = 'email' | 'sms';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const iconColor = useThemeColor({}, 'icon');
  const backgroundColor = useThemeColor({}, 'backgroundSecondary');
  const borderColor = Colors[colorScheme].border;
  const primaryColor = Colors[colorScheme].primary;

  const [selectedMethod, setSelectedMethod] = useState<RecoveryMethod>('sms');
  const [loading, setLoading] = useState(false);

  const handleSendRecovery = async () => {
    setLoading(true);
    // Simulação - Lógica será implementada depois
    setTimeout(() => {
      setLoading(false);
      if (selectedMethod === 'sms') {
        router.push('/(auth)/verification');
      } else {
        Alert.alert(
          'Email Enviado',
          'Verifique sua caixa de entrada para redefinir sua senha.'
        );
      }
    }, 1500);
  };

  const handleResend = () => {
    Alert.alert('Reenviado', 'Um novo código foi enviado.');
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
              <ThemedText style={styles.title}>Esqueceu a Senha?</ThemedText>
              <ThemedText style={styles.subtitle}>
                Selecione a opção para enviar o link de redefinição de senha
              </ThemedText>
            </View>

            <View style={styles.optionsContainer}>
              {/* Opção Email */}
              <TouchableOpacity
                style={[
                  styles.option,
                  {
                    backgroundColor,
                    borderColor: selectedMethod === 'email' ? primaryColor : borderColor,
                    borderWidth: selectedMethod === 'email' ? 2 : 1,
                  },
                ]}
                onPress={() => setSelectedMethod('email')}>
                <IconSymbol name="envelope.fill" size={24} color={iconColor} />
                <View style={styles.optionContent}>
                  <ThemedText style={styles.optionTitle}>Redefinir via Email</ThemedText>
                  <ThemedText style={styles.optionSubtitle}>
                    Link será enviado para seu email cadastrado
                  </ThemedText>
                </View>
                {selectedMethod === 'email' && (
                  <IconSymbol name="checkmark.circle.fill" size={24} color={primaryColor} />
                )}
              </TouchableOpacity>

              {/* Opção SMS */}
              <TouchableOpacity
                style={[
                  styles.option,
                  {
                    backgroundColor,
                    borderColor: selectedMethod === 'sms' ? primaryColor : borderColor,
                    borderWidth: selectedMethod === 'sms' ? 2 : 1,
                  },
                ]}
                onPress={() => setSelectedMethod('sms')}>
                <IconSymbol name="phone.fill" size={24} color={iconColor} />
                <View style={styles.optionContent}>
                  <ThemedText style={styles.optionTitle}>Redefinir via SMS</ThemedText>
                  <ThemedText style={styles.optionSubtitle}>
                    Link será enviado para seu telefone cadastrado
                  </ThemedText>
                </View>
                {selectedMethod === 'sms' && (
                  <IconSymbol name="checkmark.circle.fill" size={24} color={primaryColor} />
                )}
              </TouchableOpacity>
            </View>

            <Button
              title={selectedMethod === 'sms' ? 'Enviar SMS' : 'Enviar Email'}
              onPress={handleSendRecovery}
              loading={loading}
            />

            <View style={styles.footer}>
              <ThemedText style={styles.footerText}>Não recebeu o SMS? </ThemedText>
              <TouchableOpacity onPress={handleResend}>
                <ThemedText style={styles.footerLink}>Reenviar</ThemedText>
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
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    opacity: 0.7,
  },
  optionsContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    ...Typography.body,
    fontWeight: '600',
    marginBottom: Spacing.xs / 2,
  },
  optionSubtitle: {
    ...Typography.small,
    opacity: 0.6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
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