import { AuthorCircle } from '@/components/home/author-circle';
import { BestsellerCarousel } from '@/components/home/bestseller-carousel';
import { BookSection } from '@/components/home/book-section';
import { CategoryChip } from '@/components/home/category-chip';
import { HomeSkeleton } from '@/components/home/home-skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/contexts/auth.context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { HomeService, TrendingAuthor } from '@/services/home.service';
import { Book, BookCategory } from '@/types/book.types';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const iconColor = useThemeColor({}, 'icon');
  const backgroundColor = useThemeColor({}, 'inputBackground');
  const borderColor = Colors[colorScheme].border;
  const placeholderColor = Colors[colorScheme].textSecondary;


  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState<BookCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [trendingBooks, setTrendingBooks] = useState<Book[]>([]);
  const [recentBooks, setRecentBooks] = useState<Book[]>([]);
  const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);
  const [trendingAuthors, setTrendingAuthors] = useState<TrendingAuthor[]>([]);

  useEffect(() => {
    loadHomeData();
  }, [user]);

  const loadHomeData = async () => {
    try {
      setLoading(true);

      const promises = [
        HomeService.getCategories(),
        HomeService.getTrendingBooks(10),
        HomeService.getRecentBooks(10),
        HomeService.getTrendingAuthors(10),
      ];

      if (user) {
        promises.push(HomeService.getRecommendedBooks(user.id, 10));
      }

      const results = await Promise.all(promises);

      setCategories(results[0] as BookCategory[]);
      setTrendingBooks(results[1] as Book[]);
      setRecentBooks(results[2] as Book[]);
      setTrendingAuthors(results[3] as TrendingAuthor[]);

      if (user && results[4]) {
        setRecommendedBooks(results[4] as Book[]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados da home:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  }, [user]);

  const handleBookPress = (book: Book) => {
    router.push(`/book/${book.id}/details`);
  };

  const handleAuthorPress = (author: TrendingAuthor) => {
    router.push(`/author/${author.id}/profile` as any);
  };

  const handleSeeAllBooks = (type: 'trending' | 'recent' | 'recommended') => {
    router.push('/discover');
  };

  const handleSearchPress = () => {
    router.push('/discover');
  };

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    // Aqui você pode filtrar os livros por categoria se desejar
    // Por enquanto, só está marcando como ativo
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity>
              <IconSymbol name="person.2.fill" size={24} color={iconColor} />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Bookland</ThemedText>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerIcon}>
                <IconSymbol name="bookmark.fill" size={24} color={iconColor} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerIcon}>
                <IconSymbol name="bell.fill" size={24} color={iconColor} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Search Bar */}
            <TouchableOpacity
              style={[styles.searchContainer, { backgroundColor, borderColor }]}
              onPress={handleSearchPress}
              activeOpacity={0.7}>
              <IconSymbol name="magnifyingglass" size={20} color={iconColor} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search.."
                placeholderTextColor={placeholderColor}
                editable={false}
                pointerEvents="none"
              />
              <IconSymbol name="slider.horizontal.3" size={20} color={iconColor} />
            </TouchableOpacity>

            <HomeSkeleton />
          </ScrollView>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity>
            <IconSymbol name="person.2.fill" size={24} color={iconColor} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Bookland</ThemedText>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerIcon}>
              <IconSymbol name="bookmark.fill" size={24} color={iconColor} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon}>
              <IconSymbol name="bell.fill" size={24} color={iconColor} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          {/* Search Bar */}
          <TouchableOpacity
            style={[styles.searchContainer, { backgroundColor, borderColor }]}
            onPress={handleSearchPress}
            activeOpacity={0.7}>
            <IconSymbol name="magnifyingglass" size={20} color={iconColor} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search.."
              placeholderTextColor={placeholderColor}
              editable={false}
              pointerEvents="none"
            />
            <IconSymbol name="slider.horizontal.3" size={20} color={iconColor} />
          </TouchableOpacity>

          {/* Categories */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}>
            <CategoryChip
              category={{ id: 'all', name: 'All', slug: 'all', created_at: '' }}
              isActive={selectedCategoryId === 'all'}
              onPress={() => handleCategoryPress('all')}
            />
            {categories.map((category) => (
              <CategoryChip
                key={category.id}
                category={category}
                isActive={selectedCategoryId === category.id}
                onPress={() => handleCategoryPress(category.id)}
              />
            ))}
          </ScrollView>

          {/* Bestsellers Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Bestsellers</ThemedText>
              <TouchableOpacity onPress={() => handleSeeAllBooks('trending')}>
                <ThemedText style={[styles.seeAll, { color: Colors[colorScheme].primary }]}>
                  See All
                </ThemedText>
              </TouchableOpacity>
            </View>

            {trendingBooks.length > 0 ? (
              <BestsellerCarousel books={trendingBooks.slice(0, 5)} onBookPress={handleBookPress} />
            ) : (
              <View style={styles.emptyState}>
                <ThemedText style={styles.emptyText}>
                  No bestsellers available at the moment
                </ThemedText>
              </View>
            )}
          </View>

          {/* Authors Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Authors</ThemedText>
              <TouchableOpacity onPress={() => router.push('/discover')}>
                <ThemedText style={[styles.seeAll, { color: Colors[colorScheme].primary }]}>
                  See All
                </ThemedText>
              </TouchableOpacity>
            </View>

            {trendingAuthors.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.horizontalScroll}
                contentContainerStyle={styles.authorsContent}>
                {trendingAuthors.map((author) => (
                  <AuthorCircle
                    key={author.id}
                    author={author}
                    onPress={() => handleAuthorPress(author)}
                  />
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyState}>
                <ThemedText style={styles.emptyText}>
                  No authors available at the moment
                </ThemedText>
              </View>
            )}
          </View>

          {/* Tabs Section */}
          <View style={styles.tabsSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tabsContainer}>
              <TouchableOpacity style={[styles.tab, styles.tabActive]}>
                <ThemedText style={[styles.tabText, styles.tabTextActive]}>Top Rated</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tab}>
                <ThemedText style={styles.tabText}>New Release</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tab}>
                <ThemedText style={styles.tabText}>Top Authors</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tab}>
                <ThemedText style={styles.tabText}>Old Well</ThemedText>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Recommended Section (Only for logged users) */}
          {user && recommendedBooks.length > 0 && (
            <BookSection
              title="Recommended"
              books={recommendedBooks}
              onBookPress={handleBookPress}
              onSeeAllPress={() => handleSeeAllBooks('recommended')}
            />
          )}

          {/* Recent Section */}
          <BookSection
            title="New Release"
            books={recentBooks}
            onBookPress={handleBookPress}
            onSeeAllPress={() => handleSeeAllBooks('recent')}
          />

          {/* Trending Section */}
          <BookSection
            title="Top Rated"
            books={trendingBooks}
            onBookPress={handleBookPress}
            onSeeAllPress={() => handleSeeAllBooks('trending')}
          />

          {/* Spacer for bottom */}
          <View style={{ height: Spacing.xl }} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    ...Typography.h2,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  headerIcon: {
    width: 24,
    height: 24,
  },
  content: {
    flex: 1,
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
  categoriesContainer: {
    marginBottom: Spacing.lg,
  },
  categoriesContent: {
    paddingHorizontal: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    fontWeight: '700',
  },
  seeAll: {
    ...Typography.body,
    fontWeight: '600',
    fontSize: 13,
  },
  horizontalScroll: {
    paddingLeft: Spacing.lg,
  },
  authorsContent: {
    paddingRight: Spacing.lg,
  },
  emptyState: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.body,
    opacity: 0.6,
    textAlign: 'center',
  },
  tabsSection: {
    marginBottom: Spacing.lg,
  },
  tabsContainer: {
    paddingHorizontal: Spacing.lg,
  },
  tab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.light.primary,
  },
  tabText: {
    ...Typography.body,
    fontSize: 14,
    opacity: 0.6,
  },
  tabTextActive: {
    fontWeight: '600',
    color: Colors.light.primary,
    opacity: 1,
  },
});