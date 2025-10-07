// app/author/[id]/profile.tsx

import { BookCard } from '@/components/books/book-card';
import { AvatarPicker } from '@/components/profile/avatar-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BookService } from '@/services/book.service';
import { supabase } from '@/services/supabase';
import { User } from '@/types/auth.types';
import { Book } from '@/types/book.types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AuthorProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const iconColor = useThemeColor({}, 'icon');
  const backgroundColor = useThemeColor({}, 'backgroundSecondary');
  const borderColor = Colors[colorScheme].border;
  const primaryColor = Colors[colorScheme].primary;

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [author, setAuthor] = useState<User | null>(null);
  const [authorBooks, setAuthorBooks] = useState<Book[]>([]);

  useEffect(() => {
    if (id) {
      loadAuthorData();
    }
  }, [id]);

  const loadAuthorData = async () => {
    try {
      setLoading(true);

      // Buscar dados do autor
      const { data: authorData, error: authorError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (authorError) throw authorError;

      setAuthor(authorData);

      // Buscar livros do autor
      const books = await BookService.getUserBooks(id);
      // Filtrar apenas livros publicados
      const publishedBooks = books.filter((book) => book.status === 'published');
      setAuthorBooks(publishedBooks);
    } catch (error: any) {
      console.error('Erro ao carregar dados do autor:', error);
      Alert.alert('Erro', 'Não foi possível carregar as informações do autor.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAuthorData();
    setRefreshing(false);
  };

  const handleBookPress = (book: Book) => {
    router.push(`/book/${book.id}/details`);
  };

  const getUserInterests = () => {
    if (!author?.interests || author.interests.length === 0) return [];

    return author.interests
      .map((interestId) => {
        const interest = require('@/types/auth.types').LITERARY_INTERESTS.find(
          (i: any) => i.id === interestId
        );
        return interest;
      })
      .filter(Boolean);
  };

  const authorInterests = getUserInterests();

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={primaryColor} />
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (!author) {
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color={iconColor} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Perfil do Autor</ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          {/* Avatar e Info Básica */}
          <View style={styles.profileHeader}>
            <AvatarPicker
              currentAvatarUrl={author.avatar_url}
              onAvatarSelected={() => {}}
              size={100}
              editable={false}
            />

            <ThemedText style={styles.name}>{author.full_name || 'Autor'}</ThemedText>
            <ThemedText style={styles.email}>{author.email}</ThemedText>

            {author.bio && <ThemedText style={styles.bio}>{author.bio}</ThemedText>}
          </View>

          {/* Interesses */}
          {authorInterests.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Interesses</ThemedText>
              <View style={styles.interestsContainer}>
                {authorInterests.map((interest: any) => (
                  <View
                    key={interest.id}
                    style={[
                      styles.interestChip,
                      { backgroundColor: backgroundColor, borderColor },
                    ]}>
                    <ThemedText style={styles.interestIcon}>{interest.icon}</ThemedText>
                    <ThemedText style={styles.interestLabel}>{interest.label}</ThemedText>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Estatísticas */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Estatísticas</ThemedText>
            <View style={styles.statsContainer}>
              <View style={[styles.statCard, { backgroundColor: backgroundColor, borderColor }]}>
                <IconSymbol name="books.vertical.fill" size={32} color={primaryColor} />
                <ThemedText style={styles.statValue}>{authorBooks.length}</ThemedText>
                <ThemedText style={styles.statLabel}>
                  {authorBooks.length === 1 ? 'Livro Publicado' : 'Livros Publicados'}
                </ThemedText>
              </View>

              <View style={[styles.statCard, { backgroundColor: backgroundColor, borderColor }]}>
                <IconSymbol name="paperplane.fill" size={32} color={primaryColor} />
                <ThemedText style={styles.statValue}>
                  {authorBooks.reduce((sum, book) => sum + (book.total_chapters || 0), 0)}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Capítulos</ThemedText>
              </View>
            </View>
          </View>

          {/* Livros do Autor */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              Livros ({authorBooks.length})
            </ThemedText>

            {authorBooks.length > 0 ? (
              <View style={styles.booksGrid}>
                {authorBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onPress={() => handleBookPress(book)}
                    showStatus={false}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <IconSymbol name="books.vertical.fill" size={48} color={iconColor} />
                <ThemedText style={styles.emptyText}>
                  Este autor ainda não publicou nenhum livro
                </ThemedText>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    ...Typography.h3,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  name: {
    ...Typography.h2,
    fontWeight: '700',
    marginTop: Spacing.md,
  },
  email: {
    ...Typography.body,
    opacity: 0.6,
    marginTop: Spacing.xs,
  },
  bio: {
    ...Typography.body,
    textAlign: 'center',
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h3,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: Spacing.xs / 2,
  },
  interestIcon: {
    fontSize: 16,
  },
  interestLabel: {
    ...Typography.body,
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statValue: {
    ...Typography.h2,
    fontWeight: '700',
  },
  statLabel: {
    ...Typography.small,
    textAlign: 'center',
  },
  booksGrid: {
    gap: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
    gap: Spacing.md,
  },
  emptyText: {
    ...Typography.body,
    opacity: 0.6,
    textAlign: 'center',
    maxWidth: 250,
  },
});