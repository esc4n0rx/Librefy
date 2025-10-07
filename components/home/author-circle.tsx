// components/home/author-circle.tsx

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useImageAuth } from '@/hooks/use-image-auth';
import { TrendingAuthor } from '@/services/home.service';
import React from 'react';
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

interface AuthorCircleProps {
  author: TrendingAuthor;
  onPress: () => void;
}

export function AuthorCircle({ author, onPress }: AuthorCircleProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const borderColor = Colors[colorScheme].border;
  const iconColor = Colors[colorScheme].icon;
  const textSecondary = Colors[colorScheme].textSecondary;

  const { authenticatedUrl, loading } = useImageAuth(author.avatar_url);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.avatarContainer, { borderColor }]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={textSecondary} />
          </View>
        ) : authenticatedUrl ? (
          <Image source={{ uri: authenticatedUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.placeholderContainer, { backgroundColor: borderColor }]}>
            <IconSymbol name="person.fill" size={32} color={iconColor} />
          </View>
        )}
      </View>

      <ThemedText style={styles.name} numberOfLines={2}>
        {author.full_name || 'Autor'}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 80,
    marginRight: Spacing.md,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    borderWidth: 2,
    marginBottom: Spacing.xs,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    ...Typography.small,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 14,
  },
});