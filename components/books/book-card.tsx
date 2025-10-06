// components/books/book-card.tsx

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BOOK_STATUS_LABELS } from '@/constants/books';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Book } from '@/types/book.types';
import * as Haptics from 'expo-haptics';
import React from 'react';
import {
    Image,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

interface BookCardProps {
  book: Book;
  onPress?: () => void;
  onLongPress?: () => void;
  showStatus?: boolean;
}

export function BookCard({ book, onPress, onLongPress, showStatus = true }: BookCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = useThemeColor({}, 'backgroundSecondary');
  const borderColor = Colors[colorScheme].border;
  const textSecondary = Colors[colorScheme].textSecondary;

  const handleLongPress = () => {
    if (onLongPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onLongPress();
    }
  };

  const getStatusBadgeColor = () => {
    switch (book.status) {
      case 'published':
        return Colors[colorScheme].success;
      case 'draft':
        return Colors[colorScheme].textSecondary;
      case 'archived':
        return Colors[colorScheme].error;
      default:
        return Colors[colorScheme].textSecondary;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor, borderColor }]}
      onPress={onPress}
      onLongPress={handleLongPress}
      delayLongPress={500}
      activeOpacity={0.7}>
      {/* Cover Image */}
      <View style={styles.coverContainer}>
        {book.cover_url ? (
          <Image source={{ uri: book.cover_url }} style={styles.cover} resizeMode="cover" />
        ) : (
          <View style={[styles.coverPlaceholder, { backgroundColor: borderColor }]}>
            <IconSymbol name="books.vertical.fill" size={32} color={textSecondary} />
          </View>
        )}

        {/* Status Badge */}
        {showStatus && (
          <View style={[styles.statusBadge, { backgroundColor: getStatusBadgeColor() }]}>
            <ThemedText style={styles.statusText}>
              {BOOK_STATUS_LABELS[book.status]}
            </ThemedText>
          </View>
        )}
      </View>

      {/* Book Info */}
      <View style={styles.info}>
        <ThemedText style={styles.title} numberOfLines={2}>
          {book.title}
        </ThemedText>

        {book.synopsis && (
          <ThemedText style={styles.synopsis} numberOfLines={2}>
            {book.synopsis}
          </ThemedText>
        )}

        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.stat}>
            <IconSymbol name="books.vertical.fill" size={14} color={textSecondary} />
            <ThemedText style={styles.statText}>
              {book.total_chapters} {book.total_chapters === 1 ? 'capítulo' : 'capítulos'}
            </ThemedText>
          </View>

          {book.status === 'published' && (
            <View style={styles.stat}>
              <IconSymbol name="eye" size={14} color={textSecondary} />
              <ThemedText style={styles.statText}>{book.views_count || 0}</ThemedText>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  coverContainer: {
    width: 100,
    height: 140,
    position: 'relative',
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    ...Typography.small,
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  info: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  title: {
    ...Typography.h4,
    fontWeight: '600',
    marginBottom: Spacing.xs / 2,
  },
  synopsis: {
    ...Typography.small,
    opacity: 0.7,
    flex: 1,
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    ...Typography.small,
    opacity: 0.6,
  },
});