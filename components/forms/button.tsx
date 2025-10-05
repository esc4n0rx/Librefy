// components/forms/button.tsx
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableOpacityProps,
    ViewStyle,
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  fullWidth = true,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  
  const getBackgroundColor = () => {
    if (disabled) return Colors[colorScheme].disabled;
    
    switch (variant) {
      case 'primary':
        return Colors[colorScheme].primary;
      case 'secondary':
        return Colors[colorScheme].backgroundSecondary;
      case 'outline':
      case 'ghost':
        return 'transparent';
      default:
        return Colors[colorScheme].primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return Colors[colorScheme].textSecondary;
    
    switch (variant) {
      case 'primary':
        return '#fff';
      case 'secondary':
      case 'outline':
      case 'ghost':
        return Colors[colorScheme].text;
      default:
        return '#fff';
    }
  };

  const getBorderColor = () => {
    if (variant === 'outline') {
      return disabled ? Colors[colorScheme].disabled : Colors[colorScheme].border;
    }
    return 'transparent';
  };

  const getHeight = () => {
    switch (size) {
      case 'small':
        return 40;
      case 'medium':
        return 48;
      case 'large':
        return 56;
      default:
        return 48;
    }
  };

  const containerStyle: ViewStyle = {
    backgroundColor: getBackgroundColor(),
    borderColor: getBorderColor(),
    height: getHeight(),
    width: fullWidth ? '100%' : 'auto',
  };

  return (
    <TouchableOpacity
      style={[styles.button, containerStyle, style]}
      disabled={disabled || loading}
      {...props}>
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  text: {
    ...Typography.body,
    fontWeight: '600',
  },
});