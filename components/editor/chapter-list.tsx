// components/editor/chapter-list.tsx

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BookChapter } from '@/types/book.types';
import { BookContent, CONTENT_TYPE_LABELS } from '@/types/editor.types';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface ChapterListProps {
  chapters: BookChapter[];
  contents: BookContent[];
  selectedId: string | null;
  selectedType: 'chapter' | string;
  onSelectChapter: (chapter: BookChapter) => void;
  onSelectContent: (content: BookContent) => void;
  onAddChapter: () => void;
  onAddContent: () => void;
}

export function ChapterList({
  chapters,
  contents,
  selectedId,
  selectedType,
  onSelectChapter,
  onSelectContent,
  onAddChapter,
  onAddContent,
}: ChapterListProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = useThemeColor({}, 'backgroundSecondary');
  const borderColor = Colors[colorScheme].border;
  const primaryColor = Colors[colorScheme].primary;
  const textSecondary = Colors[colorScheme].textSecondary;

  return (
    <View style={[styles.container, { backgroundColor, borderRightColor: borderColor }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Conteúdos Especiais */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Conteúdos</ThemedText>
            <TouchableOpacity onPress={onAddContent}>
              <IconSymbol name="paperplane.fill" size={18} color={primaryColor} />
            </TouchableOpacity>
          </View>

          {contents.map((content) => (
            <TouchableOpacity
              key={content.id}
              style={[
                styles.item,
                { borderColor },
                selectedId === content.id && {
                  backgroundColor: primaryColor,
                  borderColor: primaryColor,
                },
              ]}
              onPress={() => onSelectContent(content)}
              activeOpacity={0.7}>
              <ThemedText
                style={[
                  styles.itemText,
                  selectedId === content.id && styles.itemTextActive,
                ]}
                numberOfLines={1}>
                {CONTENT_TYPE_LABELS[content.content_type]}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Capítulos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Capítulos</ThemedText>
            <TouchableOpacity onPress={onAddChapter}>
              <IconSymbol name="paperplane.fill" size={18} color={primaryColor} />
            </TouchableOpacity>
          </View>

          {chapters.length === 0 ? (
            <ThemedText style={[styles.emptyText, { color: textSecondary }]}>
              Nenhum capítulo ainda
            </ThemedText>
          ) : (
            chapters.map((chapter) => (
              <TouchableOpacity
                key={chapter.id}
                style={[
                  styles.item,
                  { borderColor },
                  selectedId === chapter.id && selectedType === 'chapter' && {
                    backgroundColor: primaryColor,
                    borderColor: primaryColor,
                  },
                ]}
                onPress={() => onSelectChapter(chapter)}
                activeOpacity={0.7}>
                <View style={styles.chapterItem}>
                  <ThemedText
                    style={[
                      styles.chapterNumber,
                      selectedId === chapter.id && selectedType === 'chapter' && styles.itemTextActive,
                    ]}>
                    {chapter.chapter_number}
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.itemText,
                      selectedId === chapter.id && selectedType === 'chapter' && styles.itemTextActive,
                    ]}
                    numberOfLines={1}>
                    {chapter.title}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 250,
    borderRightWidth: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.h4,
    fontWeight: '600',
  },
  item: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
    borderWidth: 1,
  },
  itemText: {
    ...Typography.body,
    fontSize: 13,
  },
  itemTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  chapterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  chapterNumber: {
    ...Typography.body,
    fontSize: 13,
    fontWeight: '600',
    minWidth: 20,
  },
  emptyText: {
    ...Typography.small,
    textAlign: 'center',
    paddingVertical: Spacing.md,
  },
});