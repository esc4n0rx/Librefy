// components/skeletons/library-skeleton.tsx

import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export function LibrarySkeleton() {
  const colorScheme = useColorScheme() ?? 'light';
  const skeletonColor = Colors[colorScheme].border;

  return (
    <View style={styles.container}>
      {[1, 2, 3].map((item) => (
        <View key={item} style={[styles.card, { backgroundColor: skeletonColor }]}>
          <View style={[styles.cover, { backgroundColor: Colors[colorScheme].backgroundSecondary }]} />
          <View style={styles.info}>
            <View style={[styles.title, { backgroundColor: Colors[colorScheme].backgroundSecondary }]} />
            <View style={[styles.subtitle, { backgroundColor: Colors[colorScheme].backgroundSecondary }]} />
            <View style={styles.stats}>
              <View style={[styles.stat, { backgroundColor: Colors[colorScheme].backgroundSecondary }]} />
              <View style={[styles.stat, { backgroundColor: Colors[colorScheme].backgroundSecondary }]} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
  },
  card: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  cover: {
    width: 100,
    height: 140,
  },
  info: {
    flex: 1,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  title: {
    height: 16,
    width: '80%',
    borderRadius: 4,
  },
  subtitle: {
    height: 14,
    width: '60%',
    borderRadius: 4,
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  stat: {
    height: 14,
    width: 60,
    borderRadius: 4,
  },
});