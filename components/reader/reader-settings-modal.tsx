// components/reader/reader-settings-modal.tsx

import { Button } from '@/components/forms/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
    FONT_SIZE_OPTIONS,
    LINE_HEIGHT_OPTIONS,
    ReaderSettings,
    THEME_OPTIONS,
} from '@/types/reader.types';
import React from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ReaderSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  settings: ReaderSettings;
  onUpdateSettings: (settings: ReaderSettings) => void;
}

export function ReaderSettingsModal({
  visible,
  onClose,
  settings,
  onUpdateSettings,
}: ReaderSettingsModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const iconColor = useThemeColor({}, 'icon');
  const backgroundColor = useThemeColor({}, 'backgroundSecondary');
  const borderColor = Colors[colorScheme].border;
  const primaryColor = Colors[colorScheme].primary;

  const handleUpdate = (key: keyof ReaderSettings, value: any) => {
    onUpdateSettings({
      ...settings,
      [key]: value,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: borderColor }]}>
            <ThemedText style={styles.headerTitle}>Configurações de Leitura</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol name="chevron.left" size={24} color={iconColor} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {/* Theme */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Tema</ThemedText>
              <View style={styles.optionsRow}>
                {THEME_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.themeOption,
                      {
                        backgroundColor: option.colors.bg,
                        borderColor:
                          settings.theme === option.value ? primaryColor : borderColor,
                        borderWidth: settings.theme === option.value ? 3 : 1,
                      },
                    ]}
                    onPress={() => handleUpdate('theme', option.value)}>
                    <View
                      style={[
                        styles.themePreview,
                        { backgroundColor: option.colors.text },
                      ]}
                    />
                    <ThemedText
                      style={[
                        styles.themeLabel,
                        { color: option.colors.text },
                      ]}>
                      A
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.themeLabels}>
                {THEME_OPTIONS.map((option) => (
                  <ThemedText
                    key={option.value}
                    style={[
                      styles.themeLabelText,
                      settings.theme === option.value && {
                        fontWeight: '600',
                        color: primaryColor,
                      },
                    ]}>
                    {option.label}
                  </ThemedText>
                ))}
              </View>
            </View>

            {/* Font Size */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>
                Tamanho da Fonte: {settings.fontSize}px
              </ThemedText>
              <View style={styles.optionsGrid}>
                {FONT_SIZE_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.option,
                      { backgroundColor, borderColor },
                      settings.fontSize === option.value && {
                        backgroundColor: primaryColor,
                        borderColor: primaryColor,
                      },
                    ]}
                    onPress={() => handleUpdate('fontSize', option.value)}>
                    <ThemedText
                      style={[
                        styles.optionText,
                        settings.fontSize === option.value && styles.optionTextActive,
                      ]}>
                      {option.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Line Height */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>
                Espaçamento entre linhas: {settings.lineHeight.toFixed(1)}
              </ThemedText>
              <View style={styles.optionsGrid}>
                {LINE_HEIGHT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.option,
                      { backgroundColor, borderColor },
                      settings.lineHeight === option.value && {
                        backgroundColor: primaryColor,
                        borderColor: primaryColor,
                      },
                    ]}
                    onPress={() => handleUpdate('lineHeight', option.value)}>
                    <ThemedText
                      style={[
                        styles.optionText,
                        settings.lineHeight === option.value && styles.optionTextActive,
                      ]}>
                      {option.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Font Family */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Fonte</ThemedText>
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={[
                    styles.fontOption,
                    { backgroundColor, borderColor },
                    settings.fontFamily === 'system' && {
                      backgroundColor: primaryColor,
                      borderColor: primaryColor,
                    },
                  ]}
                  onPress={() => handleUpdate('fontFamily', 'system')}>
                  <ThemedText
                    style={[
                      styles.fontOptionText,
                      settings.fontFamily === 'system' && styles.optionTextActive,
                    ]}>
                    Sistema
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.fontOption,
                    { backgroundColor, borderColor },
                    settings.fontFamily === 'serif' && {
                      backgroundColor: primaryColor,
                      borderColor: primaryColor,
                    },
                  ]}
                  onPress={() => handleUpdate('fontFamily', 'serif')}>
                  <ThemedText
                    style={[
                      styles.fontOptionText,
                      { fontFamily: 'serif' },
                      settings.fontFamily === 'serif' && styles.optionTextActive,
                    ]}>
                    Serif
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            {/* Preview */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Visualização</ThemedText>
              <View
                style={[
                  styles.preview,
                  {
                    backgroundColor: THEME_OPTIONS.find((t) => t.value === settings.theme)
                      ?.colors.bg,
                    borderColor,
                  },
                ]}>
                <ThemedText
                  style={{
                    fontSize: settings.fontSize,
                    lineHeight: settings.fontSize * settings.lineHeight,
                    fontFamily: settings.fontFamily === 'serif' ? 'serif' : 'system',
                    color: THEME_OPTIONS.find((t) => t.value === settings.theme)?.colors
                      .text,
                    textAlign: 'justify',
                  }}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
                  tempor incididunt ut labore et dolore magna aliqua.
                </ThemedText>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: borderColor }]}>
            <Button title="Fechar" onPress={onClose} />
          </View>
        </SafeAreaView>
      </ThemedView>
    </Modal>
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
    borderBottomWidth: 1,
  },
  headerTitle: {
    ...Typography.h3,
    fontWeight: '600',
  },
  closeButton: {
    padding: Spacing.xs,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h4,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    justifyContent: 'space-around',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  option: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  optionText: {
    ...Typography.body,
    fontSize: 13,
  },
  optionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  themeOption: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  themePreview: {
    width: 30,
    height: 3,
    borderRadius: 2,
    marginBottom: Spacing.xs,
  },
  themeLabel: {
    fontSize: 24,
    fontWeight: '600',
  },
  themeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.sm,
  },
  themeLabelText: {
    ...Typography.small,
    width: 80,
    textAlign: 'center',
  },
  fontOption: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  fontOptionText: {
    ...Typography.body,
    fontWeight: '600',
  },
  preview: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
  },
});