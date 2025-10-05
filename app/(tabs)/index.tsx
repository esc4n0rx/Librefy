// app/(tabs)/index.tsx
import { AuthorSkeleton } from '@/components/skeletons/author-skeleton';
import { BookSkeleton } from '@/components/skeletons/book-skeleton';
import { CategoryChipSkeleton } from '@/components/skeletons/category-chip-skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const iconColor = useThemeColor({}, 'icon');
  const backgroundColor = useThemeColor({}, 'inputBackground');
  const borderColor = Colors[colorScheme].border;
  const placeholderColor = Colors[colorScheme].textSecondary;
  const skeletonColor = Colors[colorScheme].border;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity>
            <IconSymbol name="person.2.fill" size={24} color={iconColor} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Librefy</ThemedText>
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
        >
          {/* Search Bar */}
          <View style={[styles.searchContainer, { backgroundColor, borderColor }]}>
            <IconSymbol name="magnifyingglass" size={20} color={iconColor} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar..."
              placeholderTextColor={placeholderColor}
              editable={false}
            />
            <TouchableOpacity>
              <IconSymbol name="slider.horizontal.3" size={20} color={iconColor} />
            </TouchableOpacity>
          </View>

          {/* Categories */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
          >
            <View style={[styles.categoryChip, styles.categoryChipActive]}>
              <IconSymbol name="books.vertical.fill" size={18} color="#fff" />
              <ThemedText style={styles.categoryTextActive}>Todos</ThemedText>
            </View>
            <CategoryChipSkeleton />
            <CategoryChipSkeleton />
            <CategoryChipSkeleton />
            <CategoryChipSkeleton />
          </ScrollView>

          {/* Bestsellers Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Bestsellers</ThemedText>
              <TouchableOpacity>
                <ThemedText style={styles.seeAll}>Ver Todos</ThemedText>
              </TouchableOpacity>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
            >
              {[1, 2, 3].map((item) => (
                <View key={item} style={styles.bestsellerCard}>
                  <View style={[styles.bestsellerCover, { backgroundColor: skeletonColor }]} />
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Authors Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Autores</ThemedText>
              <TouchableOpacity>
                <ThemedText style={styles.seeAll}>Ver Todos</ThemedText>
              </TouchableOpacity>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
            >
              {[1, 2, 3, 4, 5].map((item) => (
                <AuthorSkeleton key={item} />
              ))}
            </ScrollView>
          </View>

          {/* Top Rated Section */}
          <View style={styles.section}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.tabsContainer}
            >
              <TouchableOpacity style={styles.tab}>
                <ThemedText style={styles.tabText}>Grátis</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tab, styles.tabActive]}>
                <ThemedText style={styles.tabTextActive}>Mais Avaliados</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tab}>
                <ThemedText style={styles.tabText}>Lançamentos</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tab}>
                <ThemedText style={styles.tabText}>Top Autores</ThemedText>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.booksList}>
              {[1, 2, 3, 4].map((item) => (
                <BookSkeleton key={item} />
              ))}
            </View>
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
    gap: Spacing.sm,
  },
  headerIcon: {
    padding: Spacing.xs,
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
    paddingHorizontal: Spacing.lg,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    height: 40,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    backgroundColor: Colors.light.backgroundSecondary,
    gap: Spacing.xs,
  },
  categoryChipActive: {
    backgroundColor: Colors.light.primary,
  },
  categoryTextActive: {
    ...Typography.body,
    color: '#fff',
    fontWeight: '600',
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
    color: Colors.light.primary,
    fontWeight: '600',
  },
  horizontalScroll: {
    paddingLeft: Spacing.lg,
  },
  bestsellerCard: {
    marginRight: Spacing.md,
  },
  bestsellerCover: {
    width: 140,
    height: 200,
    borderRadius: BorderRadius.md,
  },
  tabsContainer: {
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  tab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.light.primary,
  },
  tabText: {
    ...Typography.body,
    opacity: 0.6,
  },
  tabTextActive: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  booksList: {
    paddingHorizontal: Spacing.lg,
  },
});