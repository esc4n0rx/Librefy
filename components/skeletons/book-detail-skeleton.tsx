// components/skeletons/book-detail-skeleton.tsx

import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export function BookDetailSkeleton() {
  const colorScheme = useColorScheme() ?? 'light';
  const skeletonColor = Colors[colorScheme].border;

  return (
    <ScrollView style={styles.container}>
      {/* Banner Skeleton */}
      <View style={[styles.banner, { backgroundColor: skeletonColor }]} />

      {/* Cover Skeleton */}
      <View style={styles.coverContainer}>
        <View style={[styles.cover, { backgroundColor: skeletonColor }]} />
      </View>

      {/* Content Skeleton */}
      <View style={styles.content}>
        <View style={[styles.title, { backgroundColor: skeletonColor }]} />
        <View style={[styles.author, { backgroundColor: skeletonColor }]} />

        <View style={styles.rating}>
          {[1, 2, 3, 4, 5].map((item) => (
            <View
              key={item}
              style={[styles.star, { backgroundColor: skeletonColor }]}
            />
          ))}
        </View>

        <View style={[styles.synopsis, { backgroundColor: skeletonColor }]} />
        <View
          style={[
            styles.synopsis,
            { backgroundColor: skeletonColor, width: '80%' },
          ]}
        />
        <View
          style={[
            styles.synopsis,
            { backgroundColor: skeletonColor, width: '60%' },
          ]}
        />

        <View style={styles.buttons}>
          <View style={[styles.button, { backgroundColor: skeletonColor }]} />
          <View style={[styles.button, { backgroundColor: skeletonColor }]} />
        </View>

        {/* Reviews Skeleton */}
        {[1, 2].map((item) => (
          <View
            key={item}
            style={[styles.review, { backgroundColor: skeletonColor }]}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  banner: {
    width: '100%',
    height: 200,
  },
  coverContainer: {
    alignItems: 'center',
    marginTop: -80,
    marginBottom: Spacing.lg,
  },
  cover: {
    width: 140,
    height: 200,
    borderRadius: BorderRadius.md,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  title: {
    height: 28,
    width: '70%',
    borderRadius: 4,
    marginBottom: Spacing.sm,
  },
  author: {
    height: 16,
    width: '50%',
    borderRadius: 4,
    marginBottom: Spacing.md,
  },
  rating: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: Spacing.lg,
  },
  star: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  synopsis: {
    height: 14,
    width: '100%',
    borderRadius: 4,
    marginBottom: Spacing.xs,
  },
  buttons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.sm,
  },
  review: {
    height: 100,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
});