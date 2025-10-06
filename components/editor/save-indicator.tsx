// components/editor/save-indicator.tsx

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

interface SaveIndicatorProps {
  isSaving: boolean;
  lastSaved?: Date | null;
}

export function SaveIndicator({ isSaving, lastSaved }: SaveIndicatorProps) {
  const colorScheme = useColorScheme() ?? 'light';

  const getTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 10) return 'agora mesmo';
    if (seconds < 60) return `há ${seconds}s`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `há ${minutes}m`;
    
    const hours = Math.floor(minutes / 60);
    return `há ${hours}h`;
  };

  return (
    <View style={styles.container}>
      {isSaving ? (
        <>
          <ActivityIndicator size="small" color={Colors[colorScheme].textSecondary} />
          <ThemedText style={styles.text}>Salvando...</ThemedText>
        </>
      ) : lastSaved ? (
        <ThemedText style={styles.text}>Salvo {getTimeAgo(lastSaved)}</ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  text: {
    ...Typography.small,
    opacity: 0.6,
  },
});