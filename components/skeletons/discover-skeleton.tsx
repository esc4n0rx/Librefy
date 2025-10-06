// components/skeletons/discover-skeleton.tsx

import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export function DiscoverSkeleton() {
  const colorScheme = useColorScheme() ?? 'light';
  const skeletonColor = Colors[colorScheme].border;

  return (
    <View style={styles.container}>
      {/* Search Bar Skeleton */}
      <View style={[styles.searchBar, { backgroundColor: skeletonColor }]} />

      {/* Category Chips Skeleton */}
      <View style={styles.chipsContainer}>
        {[1, 2, 3, 4].map((item) => (
          <View
            key={item}
            style={[styles.chip, { backgroundColor: skeletonColor }]}
          />
        ))}
      </View>

      {/* Grid Skeleton */}
      <View style={styles.grid}>
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <View key={item} style={styles.gridItem}>
            <View
              style={[styles.cover, { backgroundColor: skeletonColor }]}
            />
            <View
              style={[styles.title, { backgroundColor: skeletonColor }]}
            />
            <View
              style={[styles.author, { backgroundColor: skeletonColor }]}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    height: 48,
    borderRadius: BorderRadius.sm,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  chipsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  chip: {
    height: 40,
    width: 100,
    borderRadius: BorderRadius.full,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  gridItem: {
    width: '48%',
    marginBottom: Spacing.lg,
  },
  cover: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  title: {
    height: 16,
    width: '80%',
    borderRadius: 4,
    marginBottom: 4,
  },
  author: {
    height: 12,
    width: '60%',
    borderRadius: 4,
  },
});