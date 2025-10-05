// components/skeletons/category-chip-skeleton.tsx
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export function CategoryChipSkeleton() {
  const colorScheme = useColorScheme() ?? 'light';
  const skeletonColor = Colors[colorScheme].border;

  return (
    <View style={[styles.chip, { backgroundColor: skeletonColor }]} />
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 40,
    width: 100,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
});