// components/books/book-filters.tsx

import { ThemedText } from '@/components/themed-text';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BookCategory } from '@/types/book.types';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

interface BookFiltersProps {
  categories: BookCategory[];
  selectedCategories: string[];
  onCategoryToggle: (categoryId: string) => void;
}

export function BookFilters({
  categories,
  selectedCategories,
  onCategoryToggle,
}: BookFiltersProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = useThemeColor({}, 'backgroundSecondary');
  const borderColor = Colors[colorScheme].border;
  const primaryColor = Colors[colorScheme].primary;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}>
      {/* All filter */}
      <TouchableOpacity
        style={[
          styles.chip,
          { backgroundColor, borderColor },
          selectedCategories.length === 0 && {
            backgroundColor: primaryColor,
            borderColor: primaryColor,
          },
        ]}
        onPress={() => {
          // Clear all filters
          selectedCategories.forEach((id) => onCategoryToggle(id));
        }}>
        <ThemedText
          style={[
            styles.chipText,
            selectedCategories.length === 0 && styles.chipTextActive,
          ]}>
          Todos
        </ThemedText>
      </TouchableOpacity>

      {/* Category filters */}
      {categories.map((category) => {
        const isSelected = selectedCategories.includes(category.id);

        return (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.chip,
              { backgroundColor, borderColor },
              isSelected && {
                backgroundColor: primaryColor,
                borderColor: primaryColor,
              },
            ]}
            onPress={() => onCategoryToggle(category.id)}>
            {category.icon && (
              <ThemedText
                style={[styles.chipText, isSelected && styles.chipTextActive]}>
                {category.icon}
              </ThemedText>
            )}
            <ThemedText
              style={[styles.chipText, isSelected && styles.chipTextActive]}>
              {category.name}
            </ThemedText>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    height: 40,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: Spacing.xs / 2,
  },
  chipText: {
    ...Typography.body,
    fontSize: 13,
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
});