// app/book/[id]/read/[chapterId].tsx

import { ChapterListModal } from '@/components/reader/chapter-list-modal';
import { ReaderContent } from '@/components/reader/reader-content';
import { ReaderControls } from '@/components/reader/reader-controls';
import { ReaderHeader } from '@/components/reader/reader-header';
import { ReaderProgressBar } from '@/components/reader/reader-progress-bar';
import { ReaderSettingsModal } from '@/components/reader/reader-settings-modal';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth.context';
import { useReadingProgress } from '@/hooks/use-reading-progress';
import { BookService } from '@/services/book.service';
import { Book, BookChapter } from '@/types/book.types';
import { DEFAULT_READER_SETTINGS, ReaderSettings } from '@/types/reader.types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SETTINGS_STORAGE_KEY = '@librefy:reader_settings';

export default function ReaderScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { id: bookId, chapterId } = useLocalSearchParams<{
    id: string;
    chapterId: string;
  }>();

  // State
  const [book, setBook] = useState<Book | null>(null);
  const [chapter, setChapter] = useState<BookChapter | null>(null);
  const [chapters, setChapters] = useState<Omit<BookChapter, 'content'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_READER_SETTINGS);
  const [showChaptersList, setShowChaptersList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Reading progress
  const {
    scrollPosition,
    updateProgress,
    saveNow,
    loadProgress,
  } = useReadingProgress({
    bookId: bookId || '',
    chapterId: chapterId || '',
    enabled: !!user && !!bookId && !!chapterId,
  });

  // Load data
  useEffect(() => {
    loadData();
    loadSettings();
  }, [bookId, chapterId]);

  // Save progress on unmount
  useEffect(() => {
    return () => {
      saveNow();
    };
  }, []);

  const loadData = async () => {
    if (!bookId || !chapterId) return;

    try {
      setLoading(true);

      const [bookData, chapterData, chaptersData] = await Promise.all([
        BookService.getUserBooks(user!.id).then((books) => books.find((b) => b.id === bookId)),
        BookService.getChapter(chapterId),
        BookService.getBookChaptersBasic(bookId),
      ]);

      if (!bookData) {
        Alert.alert('Erro', 'Livro não encontrado.');
        router.back();
        return;
      }

      if (!chapterData) {
        Alert.alert('Erro', 'Capítulo não encontrado.');
        router.back();
        return;
      }

      setBook(bookData);
      setChapter(chapterData);
      setChapters(chaptersData);

      // Carregar progresso salvo
      const savedProgress = await loadProgress();
      if (savedProgress) {
        // O scroll será restaurado no ReaderContent
      }
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível carregar o capítulo.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const handleUpdateSettings = async (newSettings: ReaderSettings) => {
    setSettings(newSettings);
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
  };

  const handleBack = async () => {
    await saveNow();
    router.back();
  };

  const handleSelectChapter = async (selectedChapter: Omit<BookChapter, 'content'>) => {
    if (selectedChapter.id === chapterId) return;

    await saveNow();
    router.replace(`/book/${bookId}/read/${selectedChapter.id}` as any);
  };

  const handlePreviousChapter = () => {
    const currentIndex = chapters.findIndex((ch) => ch.id === chapterId);
    if (currentIndex > 0) {
      handleSelectChapter(chapters[currentIndex - 1]);
    }
  };

  const handleNextChapter = () => {
    const currentIndex = chapters.findIndex((ch) => ch.id === chapterId);
    if (currentIndex < chapters.length - 1) {
      handleSelectChapter(chapters[currentIndex + 1]);
    }
  };

  const currentChapterIndex = chapters.findIndex((ch) => ch.id === chapterId);
  const hasPrevious = currentChapterIndex > 0;
  const hasNext = currentChapterIndex < chapters.length - 1;

  if (loading || !book || !chapter) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            {/* Adicionar skeleton se desejar */}
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={settings.theme === 'dark' ? 'light-content' : 'dark-content'} />
      
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <ReaderHeader
          bookTitle={book.title}
          chapterTitle={chapter.title}
          onBack={handleBack}
          onOpenChapters={() => setShowChaptersList(true)}
          onOpenSettings={() => setShowSettings(true)}
        />

        {/* Progress Bar */}
        <ReaderProgressBar progress={scrollPosition} />

        {/* Content */}
        <ReaderContent
          content={chapter.content || ''}
          settings={settings}
          initialScrollPosition={scrollPosition}
          onScroll={updateProgress}
        />

        {/* Navigation Controls */}
        <ReaderControls
          onPrevious={handlePreviousChapter}
          onNext={handleNextChapter}
          hasPrevious={hasPrevious}
          hasNext={hasNext}
        />

        {/* Chapters List Modal */}
        <ChapterListModal
          visible={showChaptersList}
          onClose={() => setShowChaptersList(false)}
          chapters={chapters}
          currentChapterId={chapterId || ''}
          onSelectChapter={handleSelectChapter}
        />

        {/* Settings Modal */}
        <ReaderSettingsModal
          visible={showSettings}
          onClose={() => setShowSettings(false)}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
        />
      </SafeAreaView>
    </View>
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
});