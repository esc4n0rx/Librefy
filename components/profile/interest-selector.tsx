// components/profile/interest-selector.tsx

import { ThemedText } from '@/components/themed-text';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { LITERARY_INTERESTS } from '@/types/auth.types';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface InterestSelectorProps {
  selectedInterests: string[];
  onInterestToggle: (interestId: string) => void;
  maxSelections?: number;
}

export function InterestSelector({
  selectedInterests,
  onInterestToggle,
  maxSelections = 5,
}: InterestSelectorProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = useThemeColor({}, 'backgroundSecondary');
  const borderColor = Colors[colorScheme].border;
  const primaryColor = Colors[colorScheme].primary;

  const handleToggle = (interestId: string) => {
    if (selectedInterests.includes(interestId)) {
      onInterestToggle(interestId);
    } else if (selectedInterests.length < maxSelections) {
      onInterestToggle(interestId);
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.helperText}>
        Selecione até {maxSelections} gêneros ({selectedInterests.length}/{maxSelections})
      </ThemedText>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.interestsContainer}
        showsVerticalScrollIndicator={false}>
        {LITERARY_INTERESTS.map((interest) => {
          const isSelected = selectedInterests.includes(interest.id);
          const isDisabled =
            !isSelected && selectedInterests.length >= maxSelections;

          return (
            <TouchableOpacity
              key={interest.id}
              style={[
                styles.interestChip,
                { backgroundColor, borderColor },
                isSelected && {
                  backgroundColor: primaryColor,
                  borderColor: primaryColor,
                },
                isDisabled && styles.disabledChip,
              ]}
              onPress={() => handleToggle(interest.id)}
              disabled={isDisabled}
              activeOpacity={0.7}>
              <ThemedText
                style={[
                  styles.interestIcon,
                  isSelected && styles.interestTextActive,
                ]}>
                {interest.icon}
              </ThemedText>
              <ThemedText
                style={[
                  styles.interestLabel,
                  isSelected && styles.interestTextActive,
                ]}>
                {interest.label}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  helperText: {
    ...Typography.small,
    opacity: 0.7,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    gap: Spacing.xs,
  },
  disabledChip: {
    opacity: 0.4,
  },
  interestIcon: {
    fontSize: 18,
  },
  interestLabel: {
    ...Typography.body,
    fontSize: 14,
  },
  interestTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
});