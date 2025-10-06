// components/editor/toolbar.tsx

import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FormattingAction } from '@/types/editor.types';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface ToolbarProps {
  actions: FormattingAction[];
  onAction: (action: FormattingAction) => void;
}

export function Toolbar({ actions, onAction }: ToolbarProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = Colors[colorScheme].backgroundSecondary;
  const borderColor = Colors[colorScheme].border;
  const iconColor = Colors[colorScheme].icon;

  return (
    <View style={[styles.container, { backgroundColor, borderTopColor: borderColor }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.type}
            style={[styles.button, { borderColor }]}
            onPress={() => onAction(action)}
            activeOpacity={0.7}>
            <IconSymbol name={action.icon as any} size={20} color={iconColor} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingVertical: Spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
});