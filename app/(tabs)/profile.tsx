// app/(tabs)/profile.tsx

import { Button } from '@/components/forms/button';
import { Input } from '@/components/forms/input';
import { AvatarPicker } from '@/components/profile/avatar-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/contexts/auth.context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ProfileService } from '@/services/profile.service';
import { LITERARY_INTERESTS } from '@/types/auth.types';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut, updateProfile } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const iconColor = useThemeColor({}, 'icon');
  const backgroundColor = useThemeColor({}, 'background');
  const backgroundSecondary = useThemeColor({}, 'backgroundSecondary');
  const borderColor = Colors[colorScheme].border;
  const primaryColor = Colors[colorScheme].primary;

  const [showEditModal, setShowEditModal] = useState(false);
  const [editFullName, setEditFullName] = useState(user?.full_name || '');
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [editInterests, setEditInterests] = useState<string[]>(user?.interests || []);
  const [avatarFile, setAvatarFile] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  const getUserInterests = () => {
    if (!user?.interests || user.interests.length === 0) return [];
    return LITERARY_INTERESTS.filter((interest) => user.interests?.includes(interest.id));
  };

  const handleOpenEditModal = () => {
    setEditFullName(user?.full_name || '');
    setEditBio(user?.bio || '');
    setEditInterests(user?.interests || []);
    setAvatarFile(null);
    setShowEditModal(true);
  };

  const handleInterestToggle = (interestId: string) => {
    setEditInterests((prev) => {
      if (prev.includes(interestId)) {
        return prev.filter((id) => id !== interestId);
      } else if (prev.length < 5) {
        return [...prev, interestId];
      }
      return prev;
    });
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    if (!editFullName.trim()) {
      Alert.alert('Erro', 'Nome é obrigatório');
      return;
    }

    setSaving(true);
    try {
      // Upload avatar se mudou
      if (avatarFile) {
        await ProfileService.updateAvatar(user.id, avatarFile);
      }

      // Atualizar perfil
      await updateProfile({
        full_name: editFullName.trim(),
        bio: editBio.trim() || undefined,
        interests: editInterests,
      });

      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
      setShowEditModal(false);
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível atualizar o perfil.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            router.replace('/(auth)/login');
          } catch (error) {
            Alert.alert('Erro', 'Não foi possível sair.');
          }
        },
      },
    ]);
  };

  const userInterests = getUserInterests();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Perfil</ThemedText>
          <TouchableOpacity onPress={handleOpenEditModal} style={styles.editButton}>
            <IconSymbol name="paperplane.fill" size={20} color={primaryColor} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Avatar e Info Básica */}
          <View style={styles.profileHeader}>
            <AvatarPicker
              currentAvatarUrl={user?.avatar_url}
              onAvatarSelected={() => {}}
              size={100}
              editable={false}
            />

            <ThemedText style={styles.name}>{user?.full_name || 'Usuário'}</ThemedText>
            <ThemedText style={styles.email}>{user?.email}</ThemedText>

            {user?.bio && <ThemedText style={styles.bio}>{user.bio}</ThemedText>}
          </View>

          {/* Interesses */}
          {userInterests.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Meus Interesses</ThemedText>
              <View style={styles.interestsContainer}>
                {userInterests.map((interest) => (
                  <View
                    key={interest.id}
                    style={[
                      styles.interestChip,
                      { backgroundColor: backgroundSecondary, borderColor },
                    ]}>
                    <ThemedText style={styles.interestIcon}>{interest.icon}</ThemedText>
                    <ThemedText style={styles.interestLabel}>{interest.label}</ThemedText>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Estatísticas */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Estatísticas</ThemedText>
            <View style={styles.statsContainer}>
              <View
                style={[styles.statCard, { backgroundColor: backgroundSecondary, borderColor }]}>
                <IconSymbol name="books.vertical.fill" size={32} color={primaryColor} />
                <ThemedText style={styles.statValue}>0</ThemedText>
                <ThemedText style={styles.statLabel}>Livros Lidos</ThemedText>
              </View>

              <View
                style={[styles.statCard, { backgroundColor: backgroundSecondary, borderColor }]}>
                <IconSymbol name="paperplane.fill" size={32} color={primaryColor} />
                <ThemedText style={styles.statValue}>0</ThemedText>
                <ThemedText style={styles.statLabel}>Livros Escritos</ThemedText>
              </View>
            </View>
          </View>

          {/* Ações */}
          <View style={styles.section}>
            <Button title="Sair" variant="outline" onPress={handleSignOut} />
          </View>
        </ScrollView>

        {/* Modal de Edição */}
        <Modal
          visible={showEditModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowEditModal(false)}>
          <ThemedView style={styles.modalContainer}>
            <SafeAreaView style={styles.modalSafeArea}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalKeyboardView}>
                {/* Modal Header */}
                <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
                  <TouchableOpacity onPress={() => setShowEditModal(false)} disabled={saving}>
                    <IconSymbol name="chevron.left" size={24} color={iconColor} />
                  </TouchableOpacity>
                  <ThemedText style={styles.modalTitle}>Editar Perfil</ThemedText>
                  <View style={{ width: 24 }} />
                </View>

                <ScrollView
                  style={styles.modalContent}
                  contentContainerStyle={styles.modalScrollContent}
                  keyboardShouldPersistTaps="handled">
                  {/* Avatar */}
                  <View style={styles.modalAvatarSection}>
                    <AvatarPicker
                      currentAvatarUrl={user?.avatar_url}
                      onAvatarSelected={setAvatarFile}
                      size={100}
                    />
                  </View>

                  {/* Nome */}
                  <Input
                    label="Nome completo"
                    placeholder="Seu nome"
                    value={editFullName}
                    onChangeText={setEditFullName}
                    leftIcon="person.fill"
                    maxLength={100}
                    editable={!saving}
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
                          borderColor,
                        },
                      ]}
                      placeholder="Sobre você..."
                      placeholderTextColor={iconColor}
                      value={editBio}
                      onChangeText={setEditBio}
                      multiline
                      numberOfLines={4}
                      maxLength={200}
                      textAlignVertical="top"
                      editable={!saving}
                    />
                    <ThemedText style={styles.bioCounter}>{editBio.length}/200</ThemedText>
                  </View>

                  {/* Interesses */}
                  <View style={styles.interestsEditSection}>
                    <ThemedText style={styles.label}>Interesses (até 5)</ThemedText>
                    <ThemedText style={styles.helperText}>
                      {editInterests.length}/5 selecionados
                    </ThemedText>
                    <View style={styles.interestsEditContainer}>
                      {LITERARY_INTERESTS.map((interest) => {
                        const isSelected = editInterests.includes(interest.id);
                        const isDisabled = !isSelected && editInterests.length >= 5;

                        return (
                          <TouchableOpacity
                            key={interest.id}
                            style={[
                              styles.interestEditChip,
                              { backgroundColor: backgroundSecondary, borderColor },
                              isSelected && {
                                backgroundColor: primaryColor,
                                borderColor: primaryColor,
                              },
                              isDisabled && styles.disabledChip,
                            ]}
                            onPress={() => handleInterestToggle(interest.id)}
                            disabled={isDisabled || saving}
                            activeOpacity={0.7}>
                            <ThemedText
                              style={[
                                styles.interestEditIcon,
                                isSelected && styles.interestTextActive,
                              ]}>
                              {interest.icon}
                            </ThemedText>
                            <ThemedText
                              style={[
                                styles.interestEditLabel,
                                isSelected && styles.interestTextActive,
                              ]}>
                              {interest.label}
                            </ThemedText>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Botão Salvar */}
                  <Button title="Salvar" onPress={handleSaveProfile} loading={saving} />
                </ScrollView>
              </KeyboardAvoidingView>
            </SafeAreaView>
          </ThemedView>
        </Modal>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    ...Typography.h2,
    fontWeight: '700',
  },
  editButton: {
    padding: Spacing.xs,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  name: {
    ...Typography.h2,
    fontWeight: '700',
    marginTop: Spacing.md,
  },
  email: {
    ...Typography.body,
    opacity: 0.6,
    marginTop: Spacing.xs / 2,
  },
  bio: {
    ...Typography.body,
    textAlign: 'center',
    marginTop: Spacing.md,
    opacity: 0.8,
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h3,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: Spacing.xs / 2,
  },
  interestIcon: {
    fontSize: 16,
  },
  interestLabel: {
    ...Typography.body,
    fontSize: 13,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  statValue: {
    ...Typography.h1,
    fontWeight: '700',
  },
  statLabel: {
    ...Typography.small,
    opacity: 0.7,
    textAlign: 'center',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalSafeArea: {
    flex: 1,
  },
  modalKeyboardView: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  modalTitle: {
    ...Typography.h3,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
  },
  modalScrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  modalAvatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.md,
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
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    padding: Spacing.md,
    minHeight: 100,
  },
  bioCounter: {
    ...Typography.small,
    opacity: 0.6,
    textAlign: 'right',
    marginTop: Spacing.xs,
  },
  interestsEditSection: {
    marginBottom: Spacing.md,
  },
  helperText: {
    ...Typography.small,
    opacity: 0.7,
    marginBottom: Spacing.sm,
  },
  interestsEditContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  interestEditChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    gap: Spacing.xs / 2,
  },
  disabledChip: {
    opacity: 0.4,
  },
  interestEditIcon: {
    fontSize: 16,
  },
  interestEditLabel: {
    ...Typography.body,
    fontSize: 13,
  },
  interestTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
});