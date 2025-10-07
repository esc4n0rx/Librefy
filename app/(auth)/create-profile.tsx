import { Button } from '@/components/forms/button';
import { Input } from '@/components/forms/input';
import { AvatarPicker } from '@/components/profile/avatar-picker';
import { InterestSelector } from '@/components/profile/interest-selector';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/contexts/auth.context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ProfileService } from '@/services/profile.service';
import { CreateProfileData } from '@/types/auth.types';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const backgroundColor = useThemeColor({}, 'background');
  const backgroundSecondary = useThemeColor({}, 'backgroundSecondary');
  const iconColor = useThemeColor({}, 'icon');

  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [avatarFile, setAvatarFile] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);
  const [errors, setErrors] = useState<{ fullName?: string; interests?: string }>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: { fullName?: string; interests?: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Nome é obrigatório';
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = 'Nome deve ter no mínimo 3 caracteres';
    }

    if (selectedInterests.length === 0) {
      newErrors.interests = 'Selecione pelo menos um interesse';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !user) return;

    setLoading(true);
    try {
      const profileData: CreateProfileData = {
        full_name: fullName.trim(),
        bio: bio.trim() || undefined,
        interests: selectedInterests,
        avatar_file: avatarFile || undefined,
      };

      await ProfileService.completeProfile(user.id, profileData);

      Alert.alert('Perfil criado!', 'Bem-vindo ao Librefy!', [
        {
          text: 'OK',
          onPress: () => {
            router.replace('/(tabs)');
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível criar seu perfil. Tente novamente.');
      console.error('Erro ao criar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInterestToggle = (interestId: string) => {
    setSelectedInterests((prev) => {
      if (prev.includes(interestId)) {
        return prev.filter((id) => id !== interestId);
      } else {
        return [...prev, interestId];
      }
    });

    // Limpar erro de interests quando selecionar algo
    if (errors.interests) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.interests;
        return newErrors;
      });
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Pular configuração?',
      'Você pode configurar seu perfil depois nas configurações.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Pular',
          onPress: () => router.replace('/(tabs)'),
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {/* Header */}
            <View style={styles.header}>
              <ThemedText style={styles.title}>Complete seu perfil</ThemedText>
              <ThemedText style={styles.subtitle}>
                Personalize sua experiência no Librefy
              </ThemedText>
            </View>

            {/* Avatar */}
            <View style={styles.avatarSection}>
              <AvatarPicker
                currentAvatarUrl={user?.avatar_url}
                onAvatarSelected={setAvatarFile}
                size={120}
              />
            </View>

            {/* Nome */}
            <Input
              label="Nome completo *"
              placeholder="Como você gostaria de ser chamado?"
              value={fullName}
              onChangeText={setFullName}
              error={errors.fullName}
              leftIcon="person.fill"
              maxLength={100}
              editable={!loading}
            />

            {/* Bio */}
            <View style={styles.bioSection}>
              <ThemedText style={styles.label}>Biografia</ThemedText>
              <TextInput
                style={[
                  styles.bioInput,
                  {
                    backgroundColor: backgroundSecondary,
                    color: iconColor,
                  },
                ]}
                placeholder="Conte um pouco sobre você..."
                placeholderTextColor={iconColor}
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={4}
                maxLength={200}
                textAlignVertical="top"
                editable={!loading}
              />
              <ThemedText style={styles.bioCounter}>{bio.length}/200</ThemedText>
            </View>

            {/* Interesses */}
            <View style={styles.interestsSection}>
              <ThemedText style={styles.label}>Seus interesses literários *</ThemedText>
              {errors.interests && (
                <ThemedText style={styles.errorText}>{errors.interests}</ThemedText>
              )}
              <InterestSelector
                selectedInterests={selectedInterests}
                onInterestToggle={handleInterestToggle}
                maxSelections={5}
              />
            </View>

            {/* Botões */}
            <View style={styles.buttons}>
              <Button
                title="Concluir"
                onPress={handleSubmit}
                loading={loading}
                disabled={loading}
              />
              <Button
                title="Pular por enquanto"
                variant="ghost"
                onPress={handleSkip}
                disabled={loading}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h1,
    fontWeight: '700',
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    opacity: 0.7,
    textAlign: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  bioSection: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.body,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  bioInput: {
    ...Typography.body,
    borderRadius: 8,
    padding: Spacing.md,
    minHeight: 100,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  bioCounter: {
    ...Typography.small,
    opacity: 0.6,
    textAlign: 'right',
    marginTop: Spacing.xs,
  },
  interestsSection: {
    marginBottom: Spacing.xl,
    flex: 1,
    minHeight: 300,
  },
  errorText: {
    ...Typography.small,
    color: Colors.light.error,
    marginBottom: Spacing.xs,
  },
  buttons: {
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
});