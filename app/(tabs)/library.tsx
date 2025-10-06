// app/(tabs)/library.tsx (Atualizado)

import { BookCard } from '@/components/books/book-card';
import { BookFormModal } from '@/components/books/book-form-modal';
import { FloatingActionButton } from '@/components/books/floating-action-button';
import { BookOptionsModal } from '@/components/modals/book-options-modal';
import { LibrarySkeleton } from '@/components/skeletons/library-skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/contexts/auth.context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BookService } from '@/services/book.service';
import { Book, UserLibraryItem } from '@/types/book.types';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type TabType = 'library' | 'creating';

export default function LibraryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const iconColor = useThemeColor({}, 'icon');
  const backgroundColor = useThemeColor({}, 'backgroundSecondary');
  const borderColor = Colors[colorScheme].border;
  const primaryColor = Colors[colorScheme].primary;

  // State
  const [activeTab, setActiveTab] = useState<TabType>('library');
  const [myBooks, setMyBooks] = useState<Book[]>([]);
  const [libraryBooks, setLibraryBooks] = useState<UserLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [booksData, libraryData] = await Promise.all([
        BookService.getUserBooks(user.id),
        BookService.getUserLibrary(user.id),
      ]);

      setMyBooks(booksData);
      setLibraryBooks(libraryData);
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível carregar seus livros.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleBookPress = (bookId: string, isOwner: boolean = false) => {
    if (isOwner) {
      // Se é dono, vai para o editor
      router.push(`/book/${bookId}/editor` as any);
    } else {
      // Se não é dono, vai para os detalhes
      router.push(`/book/${bookId}/details` as any);
    }
  };

  const handleBookLongPress = (book: Book) => {
    setSelectedBook(book);
    setShowOptionsModal(true);
  };

  const handleEdit = () => {
    if (selectedBook) {
      router.push(`/book/${selectedBook.id}/editor` as any);
    }
  };

  const handlePublish = () => {
    if (!selectedBook) return;

    Alert.alert(
      'Publicar livro',
      `Tem certeza que deseja publicar "${selectedBook.title}"? Ele ficará visível para todos os usuários.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Publicar',
          onPress: async () => {
            try {
              await BookService.publishBook(selectedBook.id);
              Alert.alert('Sucesso!', 'Livro publicado com sucesso.');
              loadData();
            } catch (error: any) {
              Alert.alert('Erro', 'Não foi possível publicar o livro.');
            }
          },
        },
      ]
    );
  };

  const handleUnpublish = () => {
    if (!selectedBook) return;

    Alert.alert(
      'Despublicar livro',
      `Tem certeza que deseja despublicar "${selectedBook.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Despublicar',
          onPress: async () => {
            try {
              await BookService.updateBook(selectedBook.id, { status: 'draft' });
              Alert.alert('Sucesso!', 'Livro despublicado com sucesso.');
              loadData();
            } catch (error: any) {
              Alert.alert('Erro', 'Não foi possível despublicar o livro.');
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    if (!selectedBook) return;

    Alert.alert(
      'Apagar livro',
      `Tem certeza que deseja apagar "${selectedBook.title}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: async () => {
            try {
              await BookService.deleteBook(selectedBook.id);
              Alert.alert('Sucesso!', 'Livro apagado com sucesso.');
              loadData();
            } catch (error: any) {
              Alert.alert('Erro', 'Não foi possível apagar o livro.');
            }
          },
        },
      ]
    );
  };

  const renderEmptyState = () => {
    const isLibraryTab = activeTab === 'library';

    return (
      <View style={styles.emptyState}>
        <IconSymbol
          name={isLibraryTab ? 'books.vertical.fill' : 'paperplane.fill'}
          size={64}
          color={iconColor}
        />
        <ThemedText style={styles.emptyTitle}>
          {isLibraryTab ? 'Biblioteca vazia' : 'Nenhum livro em criação'}
        </ThemedText>
        <ThemedText style={styles.emptyDescription}>
          {isLibraryTab
            ? 'Adicione livros de outros autores para ler depois'
            : 'Comece a criar seu primeiro livro agora!'}
        </ThemedText>
        {!isLibraryTab && (
          <TouchableOpacity
            style={[styles.emptyButton, { backgroundColor: primaryColor }]}
            onPress={() => setShowCreateModal(true)}>
            <ThemedText style={styles.emptyButtonText}>Criar Livro</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Biblioteca</ThemedText>
        </View>

        {/* Tabs */}
        <View style={[styles.tabsContainer, { borderBottomColor: borderColor }]}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'library' && { borderBottomColor: primaryColor },
            ]}
            onPress={() => setActiveTab('library')}>
            <IconSymbol
              name="books.vertical.fill"
              size={20}
              color={activeTab === 'library' ? primaryColor : iconColor}
            />
            <ThemedText
              style={[
                styles.tabText,
                activeTab === 'library' && { color: primaryColor, fontWeight: '600' },
              ]}>
              Minha Biblioteca
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'creating' && { borderBottomColor: primaryColor },
            ]}
            onPress={() => setActiveTab('creating')}>
            <IconSymbol
              name="paperplane.fill"
              size={20}
              color={activeTab === 'creating' ? primaryColor : iconColor}
            />
            <ThemedText
              style={[
                styles.tabText,
                activeTab === 'creating' && { color: primaryColor, fontWeight: '600' },
              ]}>
              Criando
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {loading && !refreshing ? (
          <LibrarySkeleton />
        ) : (
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
            {activeTab === 'library' ? (
              // Library Tab
              libraryBooks.length > 0 ? (
                libraryBooks.map((item) =>
                  item.book ? (
                    <BookCard
                      key={item.id}
                      book={item.book}
                      onPress={() => handleBookPress(item.book!.id, false)}
                      showStatus={false}
                    />
                  ) : null
                )
              ) : (
                renderEmptyState()
              )
            ) : (
              // Creating Tab
              myBooks.length > 0 ? (
                myBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onPress={() => handleBookPress(book.id, true)}
                    onLongPress={() => handleBookLongPress(book)}
                    showStatus={true}
                  />
                ))
              ) : (
                renderEmptyState()
              )
            )}
          </ScrollView>
        )}

        {/* Floating Action Button - Only on "Creating" tab */}
        {activeTab === 'creating' && (
          <FloatingActionButton icon="paperplane.fill" onPress={() => setShowCreateModal(true)} />
        )}

        {/* Create Book Modal */}
        <BookFormModal
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={loadData}
        />

        {/* Book Options Modal */}
        <BookOptionsModal
          visible={showOptionsModal}
          book={selectedBook}
          onClose={() => {
            setShowOptionsModal(false);
            setSelectedBook(null);
          }}
          onEdit={handleEdit}
          onPublish={handlePublish}
          onUnpublish={handleUnpublish}
          onDelete={handleDelete}
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
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    ...Typography.body,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  emptyButton: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  emptyButtonText: {
    ...Typography.body,
    color: '#fff',
    fontWeight: '600',
  },
});