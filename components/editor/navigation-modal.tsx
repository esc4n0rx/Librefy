// components/editor/navigation-modal.tsx

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BookChapter } from '@/types/book.types';
import { BookContent, CONTENT_TYPE_LABELS } from '@/types/editor.types';
import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface NavigationModalProps {
  visible: boolean;
  onClose: () => void;
  chapters: BookChapter[];
  contents: BookContent[];
  selectedId: string | null;
  selectedType: 'chapter' | string;
  onSelectChapter: (chapter: BookChapter) => void;
  onSelectContent: (content: BookContent) => void;
  onAddChapter: () => void;
  onAddContent: () => void;
}

type TabType = 'contents' | 'chapters';

export function NavigationModal({
  visible,
  onClose,
  chapters,
  contents,
  selectedId,
  selectedType,
  onSelectChapter,
  onSelectContent,
  onAddChapter,
  onAddContent,
}: NavigationModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const iconColor = useThemeColor({}, 'icon');
  const backgroundColor = useThemeColor({}, 'backgroundSecondary');
  const borderColor = Colors[colorScheme].border;
  const primaryColor = Colors[colorScheme].primary;
  const textSecondary = Colors[colorScheme].textSecondary;

  const [activeTab, setActiveTab] = useState<TabType>('chapters');

  const handleSelectItem = (callback: () => void) => {
    callback();
    onClose();
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
            <ThemedText style={styles.headerTitle}>Navegação</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol name="chevron.left" size={24} color={iconColor} />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={[styles.tabsContainer, { borderBottomColor: borderColor }]}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'chapters' && { borderBottomColor: primaryColor },
              ]}
              onPress={() => setActiveTab('chapters')}>
              <IconSymbol
                name="books.vertical.fill"
                size={20}
                color={activeTab === 'chapters' ? primaryColor : iconColor}
              />
              <ThemedText
                style={[
                  styles.tabText,
                  activeTab === 'chapters' && {
                    color: primaryColor,
                    fontWeight: '600',
                  },
                ]}>
                Capítulos
              </ThemedText>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: activeTab === 'chapters' ? primaryColor : backgroundColor },
                ]}>
                <ThemedText
                  style={[
                    styles.badgeText,
                    activeTab === 'chapters' && styles.badgeTextActive,
                  ]}>
                  {chapters.length}
                </ThemedText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'contents' && { borderBottomColor: primaryColor },
              ]}
              onPress={() => setActiveTab('contents')}>
              <IconSymbol
                name="paperplane.fill"
                size={20}
                color={activeTab === 'contents' ? primaryColor : iconColor}
              />
              <ThemedText
                style={[
                  styles.tabText,
                  activeTab === 'contents' && {
                    color: primaryColor,
                    fontWeight: '600',
                  },
                ]}>
                Conteúdos
              </ThemedText>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: activeTab === 'contents' ? primaryColor : backgroundColor },
                ]}>
                <ThemedText
                  style={[
                    styles.badgeText,
                    activeTab === 'contents' && styles.badgeTextActive,
                  ]}>
                  {contents.length}
                </ThemedText>
              </View>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {activeTab === 'chapters' ? (
              <View style={styles.section}>
                {/* Add Chapter Button */}
                <TouchableOpacity
                  style={[styles.addButton, { backgroundColor, borderColor }]}
                  onPress={() => handleSelectItem(onAddChapter)}
                  activeOpacity={0.7}>
                  <View style={[styles.addIconContainer, { backgroundColor: primaryColor }]}>
                    <IconSymbol name="paperplane.fill" size={20} color="#fff" />
                  </View>
                  <ThemedText style={styles.addButtonText}>Adicionar Capítulo</ThemedText>
                </TouchableOpacity>

                {/* Chapters List */}
                {chapters.length === 0 ? (
                  <View style={styles.emptyState}>
                    <IconSymbol name="books.vertical.fill" size={48} color={textSecondary} />
                    <ThemedText style={[styles.emptyText, { color: textSecondary }]}>
                      Nenhum capítulo ainda
                    </ThemedText>
                  </View>
                ) : (
                  chapters.map((chapter) => (
                    <TouchableOpacity
                      key={chapter.id}
                      style={[
                        styles.item,
                        { backgroundColor, borderColor },
                        selectedId === chapter.id &&
                          selectedType === 'chapter' && {
                            backgroundColor: primaryColor,
                            borderColor: primaryColor,
                          },
                      ]}
                      onPress={() => handleSelectItem(() => onSelectChapter(chapter))}
                      activeOpacity={0.7}>
                      <View style={styles.itemLeft}>
                        <View
                          style={[
                            styles.chapterNumber,
                            {
                              backgroundColor:
                                selectedId === chapter.id && selectedType === 'chapter'
                                  ? 'rgba(255,255,255,0.2)'
                                  : Colors[colorScheme].background,
                            },
                          ]}>
                          <ThemedText
                            style={[
                              styles.chapterNumberText,
                              selectedId === chapter.id &&
                                selectedType === 'chapter' &&
                                styles.itemTextActive,
                            ]}>
                            {chapter.chapter_number}
                          </ThemedText>
                        </View>
                        <View style={styles.itemContent}>
                          <ThemedText
                            style={[
                              styles.itemTitle,
                              selectedId === chapter.id &&
                                selectedType === 'chapter' &&
                                styles.itemTextActive,
                            ]}
                            numberOfLines={1}>
                            {chapter.title}
                          </ThemedText>
                          <ThemedText
                            style={[
                              styles.itemSubtitle,
                              selectedId === chapter.id &&
                                selectedType === 'chapter' &&
                                styles.itemTextActive,
                            ]}>
                            {chapter.word_count || 0} palavras
                          </ThemedText>
                        </View>
                      </View>
                      {selectedId === chapter.id && selectedType === 'chapter' && (
                        <IconSymbol name="checkmark.circle.fill" size={24} color="#fff" />
                      )}
                    </TouchableOpacity>
                  ))
                )}
              </View>
            ) : (
              <View style={styles.section}>
                {/* Add Content Button */}
                <TouchableOpacity
                  style={[styles.addButton, { backgroundColor, borderColor }]}
                  onPress={() => handleSelectItem(onAddContent)}
                  activeOpacity={0.7}>
                  <View style={[styles.addIconContainer, { backgroundColor: primaryColor }]}>
                    <IconSymbol name="paperplane.fill" size={20} color="#fff" />
                  </View>
                  <ThemedText style={styles.addButtonText}>Adicionar Conteúdo</ThemedText>
                </TouchableOpacity>

                {/* Contents List */}
                {contents.length === 0 ? (
                  <View style={styles.emptyState}>
                    <IconSymbol name="paperplane.fill" size={48} color={textSecondary} />
                    <ThemedText style={[styles.emptyText, { color: textSecondary }]}>
                      Nenhum conteúdo especial ainda
                    </ThemedText>
                  </View>
                ) : (
                  contents.map((content) => (
                    <TouchableOpacity
                      key={content.id}
                      style={[
                        styles.item,
                        { backgroundColor, borderColor },
                        selectedId === content.id && {
                          backgroundColor: primaryColor,
                          borderColor: primaryColor,
                        },
                      ]}
                      onPress={() => handleSelectItem(() => onSelectContent(content))}
                      activeOpacity={0.7}>
                      <View style={styles.itemContent}>
                        <ThemedText
                          style={[
                            styles.itemTitle,
                            selectedId === content.id && styles.itemTextActive,
                          ]}
                          numberOfLines={1}>
                          {CONTENT_TYPE_LABELS[content.content_type]}
                        </ThemedText>
                        {content.content && (
                          <ThemedText
                            style={[
                              styles.itemSubtitle,
                              selectedId === content.id && styles.itemTextActive,
                            ]}>
                            {content.content.split(/\s+/).length} palavras
                          </ThemedText>
                        )}
                      </View>
                      {selectedId === content.id && (
                        <IconSymbol name="checkmark.circle.fill" size={24} color="#fff" />
                      )}
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
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
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    ...Typography.body,
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
  },
  badgeText: {
    ...Typography.small,
    fontWeight: '600',
    fontSize: 11,
  },
  badgeTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: Spacing.lg,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  addIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    ...Typography.body,
    fontWeight: '600',
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  itemLeft: {
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
  itemContent: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    ...Typography.body,
    fontWeight: '600',
  },
  itemSubtitle: {
    ...Typography.small,
    opacity: 0.7,
  },
  itemTextActive: {
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.md,
  },
  emptyText: {
    ...Typography.body,
    textAlign: 'center',
  },
});