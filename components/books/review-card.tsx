// components/books/review-card.tsx

import { RatingStars } from '@/components/books/rating-stars';
import { ThemedText } from '@/components/themed-text';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BookReview } from '@/types/review.types';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

interface ReviewCardProps {
  review: BookReview;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = useThemeColor({}, 'backgroundSecondary');
  const borderColor = Colors[colorScheme].border;

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Hoje';
    if (diffInDays === 1) return 'Ontem';
    if (diffInDays < 7) return `${diffInDays} dias atrás`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} semanas atrás`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} meses atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <View style={[styles.container, { backgroundColor, borderColor }]}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {review.user?.avatar_url ? (
            <Image
              source={{ uri: review.user.avatar_url }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: borderColor }]}>
              <ThemedText style={styles.avatarText}>
                {review.user?.full_name?.[0]?.toUpperCase() || 'U'}
              </ThemedText>
            </View>
          )}
          <View style={styles.userDetails}>
            <ThemedText style={styles.userName}>
              {review.user?.full_name || 'Usuário Anônimo'}
            </ThemedText>
            <ThemedText style={styles.reviewDate}>
              {formatDate(review.created_at)}
            </ThemedText>
          </View>
        </View>
        <RatingStars rating={review.rating} size={16} />
      </View>

      {review.comment && (
        <ThemedText style={styles.comment}>{review.comment}</ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...Typography.body,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    ...Typography.body,
    fontWeight: '600',
  },
  reviewDate: {
    ...Typography.small,
    opacity: 0.6,
  },
  comment: {
    ...Typography.body,
    lineHeight: 20,
  },
});