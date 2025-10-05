// components/skeletons/book-skeleton.tsx
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export function BookSkeleton() {
  const colorScheme = useColorScheme() ?? 'light';
  const skeletonColor = Colors[colorScheme].border;

  return (
    <View style={styles.container}>
      <View style={[styles.cover, { backgroundColor: skeletonColor }]} />
      <View style={styles.info}>
        <View style={[styles.title, { backgroundColor: skeletonColor }]} />
        <View style={[styles.author, { backgroundColor: skeletonColor }]} />
        <View style={styles.stats}>
          <View style={[styles.stat, { backgroundColor: skeletonColor }]} />
          <View style={[styles.stat, { backgroundColor: skeletonColor }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  cover: {
    width: 80,
    height: 120,
    borderRadius: BorderRadius.sm,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  title: {
    height: 16,
    width: '80%',
    borderRadius: 4,
  },
  author: {
    height: 14,
    width: '60%',
    borderRadius: 4,
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  stat: {
    height: 14,
    width: 40,
    borderRadius: 4,
  },
});