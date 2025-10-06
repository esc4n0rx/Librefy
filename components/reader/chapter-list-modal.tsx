// components/reader/chapter-list-modal.tsx

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BookChapter } from '@/types/book.types';
import React from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ChapterListModalProps {
  visible: boolean;
  onClose: () => void;
  chapters: Omit<BookChapter, 'content'>[];
  currentChapterId: string;
  onSelectChapter: (chapter: Omit<BookChapter, 'content'>) => void;
}

export function ChapterListModal({
  visible,
  onClose,
  chapters,
  currentChapterId,
  onSelectChapter,
}: ChapterListModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const iconColor = useThemeColor({}, 'icon');
  const backgroundColor = useThemeColor({}, 'backgroundSecondary');
  const borderColor = Colors[colorScheme].border;
  const primaryColor = Colors[colorScheme].primary;

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
            <ThemedText style={styles.headerTitle}>Capítulos</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol name="chevron.left" size={24} color={iconColor} />
            </TouchableOpacity>
          </View>

          {/* Chapters List */}
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {chapters.map((chapter) => {
              const isCurrent = chapter.id === currentChapterId;

              return (
                <TouchableOpacity
                  key={chapter.id}
                  style={[
                    styles.chapterItem,
                    { backgroundColor, borderColor },
                    isCurrent && {
                      backgroundColor: primaryColor,
                      borderColor: primaryColor,
                    },
                  ]}
                  onPress={() => {
                    onSelectChapter(chapter);
                    onClose();
                  }}
                  activeOpacity={0.7}>
                  <View style={styles.chapterLeft}>
                    <View
                      style={[
                        styles.chapterNumber,
                        {
                          backgroundColor: isCurrent
                            ? 'rgba(255,255,255,0.2)'
                            : Colors[colorScheme].background,
                        },
                      ]}>
                      <ThemedText
                        style={[
                          styles.chapterNumberText,
                          isCurrent && styles.chapterTextActive,
                        ]}>
                        {chapter.chapter_number}
                      </ThemedText>
                    </View>
                    <View style={styles.chapterInfo}>
                      <ThemedText
                        style={[
                          styles.chapterTitle,
                          isCurrent && styles.chapterTextActive,
                        ]}
                        numberOfLines={2}>
                        {chapter.title}
                      </ThemedText>
                      <ThemedText
                        style={[
                          styles.chapterMeta,
                          isCurrent && styles.chapterTextActive,
                        ]}>
                        {chapter.word_count || 0} palavras
                      </ThemedText>
                    </View>
                  </View>
                  {isCurrent && (
                    <IconSymbol name="checkmark.circle.fill" size={24} color="#fff" />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
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
    ...Typography.h2,
    fontWeight: '700',
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
  chapterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  chapterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  chapterNumber: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chapterNumberText: {
    ...Typography.h3,
    fontWeight: '700',
  },
  chapterInfo: {
    flex: 1,
    gap: 2,
  },
  chapterTitle: {
    ...Typography.body,
    fontWeight: '600',
  },
  chapterMeta: {
    ...Typography.small,
    opacity: 0.7,
  },
  chapterTextActive: {
    color: '#fff',
  },
});