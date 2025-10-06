import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface ReaderProgressBarProps {
  progress: number; // 0-100
}

export function ReaderProgressBar({ progress }: ReaderProgressBarProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const primaryColor = Colors[colorScheme].primary;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.progressBar,
          { width: `${Math.min(100, Math.max(0, progress))}%`, backgroundColor: primaryColor },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 3,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  progressBar: {
    height: '100%',
  },
});