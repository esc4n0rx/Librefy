// components/reader/reader-header.tsx

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface ReaderHeaderProps {
  bookTitle: string;
  chapterTitle: string;
  onBack: () => void;
  onOpenChapters: () => void;
  onOpenSettings: () => void;
}

export function ReaderHeader({
  bookTitle,
  chapterTitle,
  onBack,
  onOpenChapters,
  onOpenSettings,
}: ReaderHeaderProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = Colors[colorScheme].border;
  const iconColor = useThemeColor({}, 'icon');

  return (
    <View style={[styles.container, { backgroundColor, borderBottomColor: borderColor }]}>
      <TouchableOpacity onPress={onBack} style={styles.button}>
        <IconSymbol name="chevron.left" size={24} color={iconColor} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.titleContainer} onPress={onOpenChapters}>
        <View>
          <ThemedText style={styles.bookTitle} numberOfLines={1}>
            {bookTitle}
          </ThemedText>
          <ThemedText style={styles.chapterTitle} numberOfLines={1}>
            {chapterTitle}
          </ThemedText>
        </View>
        <IconSymbol name="chevron.right" size={16} color={iconColor} />
      </TouchableOpacity>

      <TouchableOpacity onPress={onOpenSettings} style={styles.button}>
        <IconSymbol name="slider.horizontal.3" size={24} color={iconColor} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  button: {
    padding: Spacing.xs,
    minWidth: 40,
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
  },
  bookTitle: {
    ...Typography.small,
    opacity: 0.6,
    textAlign: 'center',
  },
  chapterTitle: {
    ...Typography.body,
    fontWeight: '600',
    textAlign: 'center',
  },
});