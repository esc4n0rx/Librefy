// components/modals/book-options-modal.tsx

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Book } from '@/types/book.types';
import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

interface BookOption {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof IconSymbol>['name'];
  color?: string;
  destructive?: boolean;
}

interface BookOptionsModalProps {
  visible: boolean;
  book: Book | null;
  onClose: () => void;
  onEdit: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onDelete: () => void;
}

export function BookOptionsModal({
  visible,
  book,
  onClose,
  onEdit,
  onPublish,
  onUnpublish,
  onDelete,
}: BookOptionsModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = useThemeColor({}, 'backgroundSecondary');
  const borderColor = Colors[colorScheme].border;
  const primaryColor = Colors[colorScheme].primary;
  const errorColor = Colors[colorScheme].error;
  const successColor = Colors[colorScheme].success;

  if (!book) return null;

  const options: BookOption[] = [
    {
      id: 'edit',
      label: 'Editar Livro',
      icon: 'paperplane.fill',
      color: primaryColor,
    },
    book.status === 'published'
      ? {
          id: 'unpublish',
          label: 'Despublicar',
          icon: 'chevron.left',
          color: Colors[colorScheme].textSecondary,
        }
      : {
          id: 'publish',
          label: 'Publicar',
          icon: 'checkmark.circle.fill',
          color: successColor,
        },
    {
      id: 'delete',
      label: 'Apagar',
      icon: 'chevron.left',
      color: errorColor,
      destructive: true,
    },
  ];

  const handleOptionPress = (optionId: string) => {
    onClose();
    
    // Pequeno delay para a animação do modal fechar
    setTimeout(() => {
      switch (optionId) {
        case 'edit':
          onEdit();
          break;
        case 'publish':
          onPublish();
          break;
        case 'unpublish':
          onUnpublish();
          break;
        case 'delete':
          onDelete();
          break;
      }
    }, 300);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}>
        <View style={styles.modalContainer}>
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <ThemedView style={[styles.modal, { borderColor }]}>
              {/* Header */}
              <View style={[styles.header, { borderBottomColor: borderColor }]}>
                <ThemedText style={styles.title} numberOfLines={1}>
                  {book.title}
                </ThemedText>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <IconSymbol
                    name="chevron.left"
                    size={24}
                    color={Colors[colorScheme].icon}
                  />
                </TouchableOpacity>
              </View>

              {/* Options */}
              <View style={styles.options}>
                {options.map((option, index) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.option,
                      { backgroundColor, borderColor },
                      index < options.length - 1 && styles.optionNotLast,
                    ]}
                    onPress={() => handleOptionPress(option.id)}
                    activeOpacity={0.7}>
                    <View
                      style={[
                        styles.iconContainer,
                        { backgroundColor: option.color || primaryColor },
                      ]}>
                      <IconSymbol name={option.icon} size={20} color="#fff" />
                    </View>
                    <ThemedText
                      style={[
                        styles.optionLabel,
                        option.destructive && { color: errorColor },
                      ]}>
                      {option.label}
                    </ThemedText>
                    <IconSymbol
                      name="chevron.right"
                      size={20}
                      color={Colors[colorScheme].icon}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Book Info */}
              <View style={[styles.footer, { borderTopColor: borderColor }]}>
                <View style={styles.stat}>
                  <ThemedText style={styles.statLabel}>Capítulos</ThemedText>
                  <ThemedText style={styles.statValue}>{book.total_chapters}</ThemedText>
                </View>
                <View style={styles.stat}>
                  <ThemedText style={styles.statLabel}>Palavras</ThemedText>
                  <ThemedText style={styles.statValue}>
                    {book.total_words.toLocaleString()}
                  </ThemedText>
                </View>
                <View style={styles.stat}>
                  <ThemedText style={styles.statLabel}>Status</ThemedText>
                  <ThemedText style={styles.statValue}>
                    {book.status === 'published' ? 'Publicado' : 'Rascunho'}
                  </ThemedText>
                </View>
              </View>
            </ThemedView>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
  },
  modal: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  title: {
    ...Typography.h3,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.md,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  options: {
    padding: Spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.md,
  },
  optionNotLast: {
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLabel: {
    ...Typography.body,
    fontWeight: '500',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: Spacing.lg,
    borderTopWidth: 1,
  },
  stat: {
    alignItems: 'center',
    gap: Spacing.xs / 2,
  },
  statLabel: {
    ...Typography.small,
    opacity: 0.6,
  },
  statValue: {
    ...Typography.body,
    fontWeight: '600',
  },
});