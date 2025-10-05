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
    marginRight: Spacing.md,
    width: 70,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: Spacing.xs,
  },
  name: {
    height: 12,
    width: '100%',
    borderRadius: 4,
  },
});