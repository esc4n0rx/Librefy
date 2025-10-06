// components/editor/content-type-selector.tsx

import { Button } from '@/components/forms/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CONTENT_TYPE_LABELS, ContentType } from '@/types/editor.types';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ContentTypeSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: ContentType) => void;
  existingTypes: ContentType[];
}

const CONTENT_TYPES: ContentType[] = [
  'summary',
  'dedication',
  'acknowledgments',
  'prologue',
  'epilogue',
  'note',
  'preface',
];

export function ContentTypeSelector({
  visible,
  onClose,
  onSelect,
  existingTypes,
}: ContentTypeSelectorProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = Colors[colorScheme].border;
  const primaryColor = Colors[colorScheme].primary;
  const backgroundColor = useThemeColor({}, 'backgroundSecondary');

  const [selectedType, setSelectedType] = useState<ContentType | null>(null);

  const handleSelect = () => {
    if (selectedType) {
      onSelect(selectedType);
      setSelectedType(null);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedType(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={[styles.header, { borderBottomColor: borderColor }]}>
            <TouchableOpacity onPress={handleClose}>
              <IconSymbol name="chevron.left" size={24} color={iconColor} />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Adicionar Conteúdo</ThemedText>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
            <ThemedText style={styles.description}>
              Selecione o tipo de conteúdo que deseja adicionar ao seu livro:
            </ThemedText>

            {CONTENT_TYPES.map((type) => {
              const isExisting = existingTypes.includes(type);
              
              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.option,
                    { backgroundColor, borderColor },
                    selectedType === type && {
                      backgroundColor: primaryColor,
                      borderColor: primaryColor,
                    },
                    isExisting && styles.optionDisabled,
                  ]}
                  onPress={() => !isExisting && setSelectedType(type)}
                  disabled={isExisting}
                  activeOpacity={0.7}>
                  <View style={styles.optionContent}>
                    <ThemedText
                      style={[
                        styles.optionTitle,
                        selectedType === type && styles.optionTextActive,
                        isExisting && styles.optionTextDisabled,
                      ]}>
                      {CONTENT_TYPE_LABELS[type]}
                    </ThemedText>
                    {isExisting && (
                      <ThemedText style={styles.existingBadge}>Já existe</ThemedText>
                    )}
                  </View>
                  {selectedType === type && (
                    <IconSymbol name="checkmark.circle.fill" size={24} color="#fff" />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title="Adicionar"
              onPress={handleSelect}
              disabled={!selectedType}
            />
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  description: {
    ...Typography.body,
    opacity: 0.7,
    marginBottom: Spacing.lg,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    ...Typography.body,
    fontWeight: '500',
  },
  optionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  optionTextDisabled: {
    opacity: 0.6,
  },
  existingBadge: {
    ...Typography.small,
    opacity: 0.6,
    marginTop: 2,
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
});