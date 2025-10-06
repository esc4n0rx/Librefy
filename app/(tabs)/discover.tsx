// app/(tabs)/discover.tsx

import { BookFilters } from '@/components/books/book-filters';
import { BookGridCard } from '@/components/books/book-grid-card';
import { DiscoverSkeleton } from '@/components/skeletons/discover-skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ITEMS_PER_PAGE } from '@/constants/books';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BookService } from '@/services/book.service';
import { DiscoverService } from '@/services/discover.service';
import { Book, BookCategory } from '@/types/book.types';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DiscoverScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const iconColor = useThemeColor({}, 'icon');
  const backgroundColor = useThemeColor({}, 'inputBackground');
  const borderColor = Colors[colorScheme].border;
  const placeholderColor = Colors[colorScheme].textSecondary;
  const textSecondary = Colors[colorScheme].textSecondary;

  // State
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<BookCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Load initial data
  useEffect(() => {
    loadCategories();
    loadBooks(true);
  }, []);

  // Load books when filters change
  useEffect(() => {
    if (!loading) {
      loadBooks(true);
    }
  }, [selectedCategories]);

  const loadCategories = async () => {
    try {
      const data = await BookService.getCategories();
      setCategories(data);
    } catch (error: any) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const loadBooks = async (reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
        setCurrentPage(1);
      } else {
        setLoadingMore(true);
      }

      const page = reset ? 1 : currentPage + 1;

      const { books: newBooks, total } = await DiscoverService.searchBooks({
        search: searchQuery || undefined,
        category_ids: selectedCategories.length > 0 ? selectedCategories : undefined,
        sort: 'popular',
        page,
        limit: ITEMS_PER_PAGE,
      });

      if (reset) {
        setBooks(newBooks);
      } else {
        setBooks((prev) => [...prev, ...newBooks]);
      }

      setCurrentPage(page);
      setHasMore(books.length + newBooks.length < total);
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível carregar os livros.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadBooks(true);
  }, [searchQuery, selectedCategories]);

  const handleSearch = () => {
    loadBooks(true);
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleBookPress = (bookId: string) => {
    router.push(`/book/${bookId}/details` as any);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadBooks(false);
    }
  };

  const renderBookItem = ({ item }: { item: Book }) => (
    <BookGridCard book={item} onPress={() => handleBookPress(item.id)} />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <IconSymbol name="magnifyingglass" size={64} color={textSecondary} />
      <ThemedText style={styles.emptyTitle}>Nenhum livro encontrado</ThemedText>
      <ThemedText style={styles.emptyDescription}>
        Tente ajustar os filtros ou fazer uma nova busca
      </ThemedText>
    </View>
  );

  if (loading && books.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.header}>
            <ThemedText style={styles.headerTitle}>Descobrir</ThemedText>
          </View>
          <DiscoverSkeleton />
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Descobrir</ThemedText>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor, borderColor }]}>
          <IconSymbol name="magnifyingglass" size={20} color={iconColor} />
          <TextInput
            style={[styles.searchInput, { color: iconColor }]}
            placeholder="Buscar livros..."
            placeholderTextColor={placeholderColor}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                loadBooks(true);
              }}>
              <IconSymbol name="chevron.left" size={20} color={iconColor} />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filters */}
        <BookFilters
          categories={categories}
          selectedCategories={selectedCategories}
          onCategoryToggle={handleCategoryToggle}
        />

        {/* Books Grid */}
        <FlatList
          data={books}
          renderItem={renderBookItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.loadingMore}>
                <ThemedText style={styles.loadingMoreText}>
                  Carregando mais...
                </ThemedText>
              </View>
            ) : null
          }
        />
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
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    ...Typography.h2,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    height: 48,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
  },
  gridContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  row: {
    justifyContent: 'space-between',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  emptyTitle: {
    ...Typography.h3,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyDescription: {
    ...Typography.body,
    textAlign: 'center',
    opacity: 0.6,
  },
  loadingMore: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  loadingMoreText: {
    ...Typography.body,
    opacity: 0.6,
  },
});