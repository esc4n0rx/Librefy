// components/books/rating-stars.tsx

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export function RatingStars({
  rating,
  maxRating = 5,
  size = 20,
  interactive = false,
  onRatingChange,
}: RatingStarsProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const activeColor = '#FFB800'; // Cor dourada para estrelas
  const inactiveColor = Colors[colorScheme].border;

  const handlePress = (value: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: maxRating }, (_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= Math.round(rating);

        return interactive ? (
          <TouchableOpacity
            key={index}
            onPress={() => handlePress(starValue)}
            style={styles.star}>
            <IconSymbol
              name="checkmark.circle.fill"
              size={size}
              color={isFilled ? activeColor : inactiveColor}
            />
          </TouchableOpacity>
        ) : (
          <View key={index} style={styles.star}>
            <IconSymbol
              name="checkmark.circle.fill"
              size={size}
              color={isFilled ? activeColor : inactiveColor}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  star: {
    padding: 2,
  },
});