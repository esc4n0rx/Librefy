// components/home/book-section.tsx

import { BookHorizontalCard } from '@/components/home/book-horizontal-card';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Book } from '@/types/book.types';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface BookSectionProps {
  title: string;
  books: Book[];
  onBookPress: (book: Book) => void;
  onSeeAllPress?: () => void;
  loading?: boolean;
}

export function BookSection({
  title,
  books,
  onBookPress,
  onSeeAllPress,
  loading = false,
}: BookSectionProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const primaryColor = Colors[colorScheme].primary;
  const skeletonColor = Colors[colorScheme].border;

  if (loading) {
    return (
      <View style={styles.section}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>{title}</ThemedText>
          {onSeeAllPress && (
            <TouchableOpacity onPress={onSeeAllPress}>
              <ThemedText style={[styles.seeAll, { color: primaryColor }]}>See All</ThemedText>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.list}>
          {[1, 2, 3].map((item) => (
            <View key={item} style={[styles.skeletonCard, { backgroundColor: skeletonColor }]} />
          ))}
        </View>
      </View>
    );
  }

  if (books.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        {onSeeAllPress && (
          <TouchableOpacity onPress={onSeeAllPress}>
            <ThemedText style={[styles.seeAll, { color: primaryColor }]}>See All</ThemedText>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.list}>
        {books.slice(0, 3).map((book) => (
          <BookHorizontalCard key={book.id} book={book} onPress={() => onBookPress(book)} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h3,
    fontWeight: '700',
  },
  seeAll: {
    ...Typography.body,
    fontWeight: '600',
  },
  list: {
    gap: 0,
  },
  skeletonCard: {
    height: 140,
    borderRadius: 8,
    marginBottom: Spacing.md,
  },
});