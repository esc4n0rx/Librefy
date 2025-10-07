// components/home/home-skeleton.tsx

import { CategoryChipSkeleton } from '@/components/skeletons/category-chip-skeleton';
import { ThemedText } from '@/components/themed-text';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export function HomeSkeleton() {
  const colorScheme = useColorScheme() ?? 'light';
  const skeletonColor = Colors[colorScheme].border;

  return (
    <View style={styles.container}>
      {/* Categories Skeleton */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
        <View style={[styles.categoryChip, styles.categoryChipActive]}>
          <View style={styles.categoryIcon} />
          <ThemedText style={styles.categoryTextActive}>All</ThemedText>
        </View>
        <CategoryChipSkeleton />
        <CategoryChipSkeleton />
        <CategoryChipSkeleton />
      </ScrollView>

      {/* Bestsellers Section Skeleton */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Bestsellers</ThemedText>
          <View style={[styles.seeAllSkeleton, { backgroundColor: skeletonColor }]} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontal}>
          {[1, 2, 3].map((item) => (
            <View key={item} style={styles.bestsellerCard}>
              <View style={[styles.bestsellerCover, { backgroundColor: skeletonColor }]} />
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Authors Section Skeleton */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Authors</ThemedText>
          <View style={[styles.seeAllSkeleton, { backgroundColor: skeletonColor }]} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontal}>
          {[1, 2, 3, 4, 5].map((item) => (
            <View key={item} style={styles.authorCard}>
              <View style={[styles.authorAvatar, { backgroundColor: skeletonColor }]} />
              <View style={[styles.authorName, { backgroundColor: skeletonColor }]} />
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Tabs Skeleton */}
      <View style={styles.tabsSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
          {[1, 2, 3, 4].map((item) => (
            <View key={item} style={[styles.tab, { backgroundColor: skeletonColor }]} />
          ))}
        </ScrollView>
      </View>

      {/* Book Sections Skeleton */}
      {[1, 2, 3].map((section) => (
        <View key={section} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionTitleSkeleton, { backgroundColor: skeletonColor }]} />
            <View style={[styles.seeAllSkeleton, { backgroundColor: skeletonColor }]} />
          </View>
          <View style={styles.booksList}>
            {[1, 2, 3].map((item) => (
              <View key={item} style={[styles.bookCard, { backgroundColor: skeletonColor }]} />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categories: {
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    backgroundColor: Colors.light.backgroundSecondary,
    gap: Spacing.xs / 2,
  },
  categoryChipActive: {
    backgroundColor: Colors.light.primary,
  },
  categoryIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  categoryTextActive: {
    ...Typography.body,
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    fontWeight: '700',
  },
  sectionTitleSkeleton: {
    height: 20,
    width: 120,
    borderRadius: 4,
  },
  seeAllSkeleton: {
    height: 14,
    width: 60,
    borderRadius: 4,
  },
  horizontal: {
    paddingLeft: Spacing.lg,
  },
  bestsellerCard: {
    marginRight: Spacing.md,
  },
  bestsellerCover: {
    width: 180,
    height: 270,
    borderRadius: BorderRadius.lg,
  },
  authorCard: {
    alignItems: 'center',
    marginRight: Spacing.md,
    width: 70,
  },
  authorAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: Spacing.xs,
  },
  authorName: {
    height: 12,
    width: 60,
    borderRadius: 4,
  },
  tabsSection: {
    marginBottom: Spacing.lg,
  },
  tabs: {
    paddingHorizontal: Spacing.lg,
  },
  tab: {
    height: 32,
    width: 80,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.sm,
  },
  booksList: {
    paddingHorizontal: Spacing.lg,
  },
  bookCard: {
    height: 140,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
});