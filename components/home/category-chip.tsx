// components/home/category-chip.tsx

import { ThemedText } from '@/components/themed-text';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BookCategory } from '@/types/book.types';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface CategoryChipProps {
  category: BookCategory;
  isActive: boolean;
  onPress: () => void;
}

export function CategoryChip({ category, isActive, onPress }: CategoryChipProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const primaryColor = Colors[colorScheme].primary;
  const backgroundColor = Colors[colorScheme].backgroundSecondary;

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        {
          backgroundColor: isActive ? primaryColor : backgroundColor,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}>
      {category.icon && (
        <ThemedText style={[styles.icon, { color: isActive ? '#fff' : undefined }]}>
          {category.icon}
        </ThemedText>
      )}
      <ThemedText
        style={[
          styles.label,
          {
            color: isActive ? '#fff' : undefined,
            fontWeight: isActive ? '600' : '400',
          },
        ]}>
        {category.name}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    gap: Spacing.xs / 2,
  },
  icon: {
    fontSize: 14,
  },
  label: {
    ...Typography.body,
    fontSize: 13,
  },
});