// components/home/book-horizontal-card.tsx

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useImageAuth } from '@/hooks/use-image-auth';
import { Book } from '@/types/book.types';
import React from 'react';
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

interface BookHorizontalCardProps {
  book: Book;
  onPress: () => void;
}

export function BookHorizontalCard({ book, onPress }: BookHorizontalCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const borderColor = Colors[colorScheme].border;
  const backgroundColor = Colors[colorScheme].backgroundSecondary;
  const textSecondary = Colors[colorScheme].textSecondary;
  const iconColor = Colors[colorScheme].icon;

  const { authenticatedUrl, loading } = useImageAuth(book.cover_url);

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor, borderColor }]}
      onPress={onPress}
      activeOpacity={0.7}>
      {/* Cover */}
      <View style={[styles.coverContainer, { backgroundColor: borderColor }]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={textSecondary} />
          </View>
        ) : authenticatedUrl ? (
          <Image source={{ uri: authenticatedUrl }} style={styles.cover} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderContainer}>
            <IconSymbol name="books.vertical.fill" size={24} color={iconColor} />
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <ThemedText style={styles.title} numberOfLines={2}>
          {book.title}
        </ThemedText>
        <ThemedText style={styles.author} numberOfLines={1}>
          by {book.author?.full_name || 'Unknown'}
        </ThemedText>

        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.stat}>
            <ThemedText style={styles.statValue}>{book.total_chapters || 0}</ThemedText>
            <ThemedText style={styles.statLabel}>chapters</ThemedText>
          </View>

          <View style={styles.divider} />

          <View style={styles.stat}>
            <ThemedText style={styles.statValue}>
              {book.views_count >= 1000
                ? `${(book.views_count / 1000).toFixed(1)}k`
                : book.views_count || 0}
            </ThemedText>
            <ThemedText style={styles.statLabel}>views</ThemedText>
          </View>
        </View>
      </View>

      {/* Rating */}
      <View style={styles.ratingContainer}>
        <IconSymbol name="star.fill" size={16} color="#FFD700" />
        <ThemedText style={styles.rating}>5.0</ThemedText>
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
    padding: Spacing.sm,
    gap: Spacing.md,
  },
  coverContainer: {
    width: 80,
    height: 120,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  title: {
    ...Typography.body,
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 20,
  },
  author: {
    ...Typography.small,
    opacity: 0.6,
    fontSize: 12,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    ...Typography.body,
    fontWeight: '600',
    fontSize: 14,
  },
  statLabel: {
    ...Typography.small,
    opacity: 0.6,
    fontSize: 11,
  },
  divider: {
    width: 1,
    height: 12,
    backgroundColor: Colors.light.border,
    opacity: 0.5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
  },
  rating: {
    ...Typography.small,
    fontWeight: '600',
    fontSize: 12,
  },
});