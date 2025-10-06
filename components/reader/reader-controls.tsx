// components/reader/reader-controls.tsx

import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface ReaderControlsProps {
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

export function ReaderControls({
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}: ReaderControlsProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const primaryColor = Colors[colorScheme].primary;

  return (
    <View style={styles.container}>
      {hasPrevious && (
        <TouchableOpacity
          style={[styles.button, styles.previousButton, { backgroundColor: primaryColor }]}
          onPress={onPrevious}
          activeOpacity={0.8}>
          <IconSymbol name="chevron.left" size={24} color="#fff" />
        </TouchableOpacity>
      )}

      {hasNext && (
        <TouchableOpacity
          style={[styles.button, styles.nextButton, { backgroundColor: primaryColor }]}
          onPress={onNext}
          activeOpacity={0.8}>
          <IconSymbol name="chevron.right" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'box-none',
  },
  button: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  previousButton: {
    bottom: 24,
    left: 24,
  },
  nextButton: {
    bottom: 24,
    right: 24,
  },
});