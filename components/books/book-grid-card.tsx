// components/books/book-grid-card.tsx

import { RatingStars } from '@/components/books/rating-stars';
import { ThemedText } from '@/components/themed-text';
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

interface BookGridCardProps {
  book: Book;
  onPress: () => void;
}

export function BookGridCard({ book, onPress }: BookGridCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const borderColor = Colors[colorScheme].border;
  const textSecondary = Colors[colorScheme].textSecondary;

  const { authenticatedUrl, loading } = useImageAuth(book.cover_url);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}>
      {/* Cover Image */}
      <View style={[styles.coverContainer, { backgroundColor: borderColor }]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={textSecondary} />
          </View>
        ) : authenticatedUrl ? (
          <Image
            source={{ uri: authenticatedUrl }}
            style={styles.cover}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <ThemedText style={styles.placeholderText}>📚</ThemedText>
          </View>
        )}
      </View>

      {/* Book Info */}
      <View style={styles.info}>
        <ThemedText style={styles.title} numberOfLines={2}>
          {book.title}
        </ThemedText>

        <ThemedText style={styles.author} numberOfLines={1}>
          {book.author?.full_name || 'Autor Desconhecido'}
        </ThemedText>

        {/* Rating and Pages */}
        <View style={styles.metadata}>
          <RatingStars rating={0} size={14} />
          <ThemedText style={styles.metadataText}>
            {book.total_chapters} cap.
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '48%',
    marginBottom: Spacing.lg,
  },
  coverContainer: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
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
  placeholderText: {
    fontSize: 48,
  },
  info: {
    gap: 2,
  },
  title: {
    ...Typography.body,
    fontWeight: '600',
    lineHeight: 18,
  },
  author: {
    ...Typography.small,
    opacity: 0.6,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 2,
  },
  metadataText: {
    ...Typography.small,
    opacity: 0.6,
  },
});