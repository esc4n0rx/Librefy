// components/forms/social-button.tsx
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface SocialButtonProps extends TouchableOpacityProps {
  provider: 'google' | 'twitter' | 'facebook';
  loading?: boolean;
}

const ICON_MAP = {
  google: 'g.circle.fill' as const,
  twitter: 'bird.fill' as const,
  facebook: 'f.circle.fill' as const,
};

export function SocialButton({ provider, loading = false, disabled, ...props }: SocialButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = useThemeColor({}, 'backgroundSecondary');
  const borderColor = Colors[colorScheme].border;
  const iconColor = Colors[colorScheme].text;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor, borderColor },
        (disabled || loading) && styles.disabled,
      ]}
      disabled={disabled || loading}
      {...props}>
      {loading ? (
        <ActivityIndicator color={iconColor} size="small" />
      ) : (
        <IconSymbol name={ICON_MAP[provider]} size={24} color={iconColor} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});