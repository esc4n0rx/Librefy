import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export function AuthorSkeleton() {
  const colorScheme = useColorScheme() ?? 'light';
  const skeletonColor = Colors[colorScheme].border;

  return (
    <View style={styles.container}>
      <View style={[styles.avatar, { backgroundColor: skeletonColor }]} />
      <View style={[styles.name, { backgroundColor: skeletonColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 80,
    marginRight: Spacing.md,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: Spacing.xs,
  },
  name: {
    height: 12,
    width: 60,
    borderRadius: 4,
  },
});