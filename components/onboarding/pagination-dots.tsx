// components/onboarding/pagination-dots.tsx
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface PaginationDotsProps {
  data: any[];
  scrollX: Animated.Value;
}

export function PaginationDots({ data, scrollX }: PaginationDotsProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const activeColor = Colors[colorScheme].primary;
  const inactiveColor = Colors[colorScheme].border;

  return (
    <View style={styles.container}>
      {data.map((_, index) => {
        const inputRange = [
          (index - 1) * 300,
          index * 300,
          (index + 1) * 300,
        ];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                width: dotWidth,
                backgroundColor: activeColor,
                opacity,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.lg,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});