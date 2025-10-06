// components/editor/text-editor.tsx

import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';

interface TextEditorProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
}

export function TextEditor({ value, onChangeText, ...props }: TextEditorProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = Colors[colorScheme].textSecondary;

  return (
    <TextInput
      style={[styles.editor, { backgroundColor, color: textColor }]}
      value={value}
      onChangeText={onChangeText}
      placeholder="Comece a escrever..."
      placeholderTextColor={placeholderColor}
      multiline
      textAlignVertical="top"
      autoCorrect
      autoCapitalize="sentences"
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  editor: {
    flex: 1,
    ...Typography.body,
    lineHeight: 24,
    padding: Spacing.lg,
  },
});