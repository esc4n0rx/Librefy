// components/books/floating-action-button.tsx

import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface FloatingActionButtonProps extends TouchableOpacityProps {
  icon?: React.ComponentProps<typeof IconSymbol>['name'];
}

export function FloatingActionButton({ 
  icon = 'paperplane.fill', 
  ...props 
}: FloatingActionButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = Colors[colorScheme].primary;

  return (
    <TouchableOpacity
      style={[styles.fab, { backgroundColor }]}
      activeOpacity={0.8}
      {...props}>
      <IconSymbol name={icon} size={24} color="#fff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.lg,
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
});