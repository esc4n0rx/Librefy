// app/book/[id]/editor.tsx

import { FloatingActionButton } from '@/components/books/floating-action-button';
import { ContentTypeSelector } from '@/components/editor/content-type-selector';
import { NavigationModal } from '@/components/editor/navigation-modal';
import { SaveIndicator } from '@/components/editor/save-indicator';
import { TextEditor } from '@/components/editor/text-editor';
import { Toolbar } from '@/components/editor/toolbar';
import { Button } from '@/components/forms/button';
import { Input } from '@/components/forms/input';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/contexts/auth.context';
import { useAutoSave } from '@/hooks/use-auto-save';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BookService } from '@/services/book.service';
import { ContentService } from '@/services/content.service';
import { Book, BookChapter } from '@/types/book.types';
import { BookContent, CONTENT_TYPE_LABELS, ContentType, FORMATTING_ACTIONS } from '@/types/editor.types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BookEditorScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const iconColor = useThemeColor({}, 'icon');
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = Colors[colorScheme].border;
  const primaryColor = Colors[colorScheme].primary;
  const placeholderColor = Colors[colorScheme].textSecondary;

  // State
  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<BookChapter[]>([]);
  const [contents, setContents] = useState<BookContent[]>([]);
  const [loading, setLoading] = useState(true);

  // Editor state
  const [selectedType, setSelectedType] = useState<'chapter' | ContentType | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [editorTitle, setEditorTitle] = useState('');

  // Modals
  const [showNavigation, setShowNavigation] = useState(false);
  const [showContentSelector, setShowContentSelector] = useState(false);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');

  // Auto-save
  const { triggerSave, saveNow, isSaving, lastSaved, hasUnsavedChanges } = useAutoSave({
    onSave: handleSave,
    delay: 3000,
  });

  // Load data
  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const [bookData, chaptersData, contentsData] = await Promise.all([
        BookService.getUserBooks(user!.id).then((books) => books.find((b) => b.id === id)),
        BookService.getBookChapters(id),
        ContentService.getBookContents(id),
      ]);

      if (!bookData) {
        Alert.alert('Erro', 'Livro não encontrado.');
        router.back();
        return;
      }

      setBook(bookData);
      setChapters(chaptersData);
      setContents(contentsData);

      // Selecionar primeiro capítulo se existir
      if (chaptersData.length > 0) {
        loadChapter(chaptersData[0]);
      } else if (contentsData.length > 0) {
        loadContent(contentsData[0]);
      }
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível carregar o livro.');
    } finally {
      setLoading(false);
    }
  };

  async function handleSave(data: { content: string; title?: string }) {
    if (!selectedType || !id) return;

    try {
      if (selectedType === 'chapter' && selectedId) {
        // Salvar capítulo
        await ContentService.updateChapterContent(selectedId, data.content);
        
        // Atualizar título se mudou
        if (data.title) {
          const { error } = await BookService.supabase
            .from('book_chapters')
            .update({ title: data.title })
            .eq('id', selectedId);
          
          if (error) throw error;
        }

        // Atualizar local
        setChapters((prev) =>
          prev.map((ch) =>
            ch.id === selectedId
              ? { ...ch, content: data.content, title: data.title || ch.title }
              : ch
          )
        );
      } else {
        // Salvar conteúdo especial
        await ContentService.upsertContent(id, selectedType as ContentType, {
          content: data.content,
          title: data.title,
        });

        // Recarregar conteúdos
        const updatedContents = await ContentService.getBookContents(id);
        setContents(updatedContents);
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      throw error;
    }
  }

  const handleSelectChapter = (chapter: BookChapter) => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Alterações não salvas',
        'Deseja salvar as alterações antes de trocar de capítulo?',
        [
          {
            text: 'Descartar',
            style: 'destructive',
            onPress: () => loadChapter(chapter),
          },
          {
            text: 'Salvar',
            onPress: async () => {
              await saveNow();
              loadChapter(chapter);
            },
          },
        ]
      );
    } else {
      loadChapter(chapter);
    }
  };

  const loadChapter = (chapter: BookChapter) => {
    setSelectedType('chapter');
    setSelectedId(chapter.id);
    setEditorContent(chapter.content || '');
    setEditorTitle(chapter.title);
  };

  const handleSelectContent = (content: BookContent) => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Alterações não salvas',
        'Deseja salvar as alterações antes de trocar de conteúdo?',
        [
          {
            text: 'Descartar',
            style: 'destructive',
            onPress: () => loadContent(content),
          },
          {
            text: 'Salvar',
            onPress: async () => {
              await saveNow();
              loadContent(content);
            },
          },
        ]
      );
    } else {
      loadContent(content);
    }
  };

  const loadContent = (content: BookContent) => {
    setSelectedType(content.content_type);
    setSelectedId(content.id);
    setEditorContent(content.content || '');
    setEditorTitle(content.title || CONTENT_TYPE_LABELS[content.content_type]);
  };

  const handleContentChange = (text: string) => {
    setEditorContent(text);
    triggerSave({ content: text, title: editorTitle });
  };

  const handleTitleChange = (text: string) => {
    setEditorTitle(text);
    triggerSave({ content: editorContent, title: text });
  };

  const handleAddChapter = () => {
    setNewChapterTitle('');
    setShowChapterModal(true);
  };

  const handleCreateChapter = async () => {
    if (!newChapterTitle.trim() || !id) {
      Alert.alert('Erro', 'Digite um título para o capítulo.');
      return;
    }

    try {
      const newChapter = await BookService.createChapter({
        book_id: id,
        title: newChapterTitle.trim(),
        chapter_number: chapters.length + 1,
        content: '',
      });

      setChapters((prev) => [...prev, newChapter]);
      setShowChapterModal(false);
      loadChapter(newChapter);
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível criar o capítulo.');
    }
  };

  const handleAddContent = () => {
    setShowContentSelector(true);
  };

  const handleCreateContent = async (contentType: ContentType) => {
    if (!id) return;

    try {
      const newContent = await ContentService.upsertContent(id, contentType, {
        content: '',
        title: CONTENT_TYPE_LABELS[contentType],
        position: contents.length,
      });

      const updatedContents = await ContentService.getBookContents(id);
      setContents(updatedContents);
      
      // Selecionar o novo conteúdo
      const created = updatedContents.find((c) => c.content_type === contentType);
      if (created) {
        loadContent(created);
      }
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível criar o conteúdo.');
    }
  };

  const handleFormattingAction = (action: any) => {
    // Implementação básica de formatação
    const cursor = editorContent.length;
    let insertion = '';
    
    switch (action.type) {
      case 'bold':
        insertion = '**texto em negrito**';
        break;
      case 'italic':
        insertion = '*texto em itálico*';
        break;
      case 'h1':
        insertion = '\n# Título 1\n';
        break;
      case 'h2':
        insertion = '\n## Título 2\n';
        break;
      case 'h3':
        insertion = '\n### Título 3\n';
        break;
      case 'bullet':
        insertion = '\n- Item da lista\n';
        break;
      case 'quote':
        insertion = '\n> Citação\n';
        break;
      default:
        return;
    }

    const newContent = editorContent + insertion;
    setEditorContent(newContent);
    triggerSave({ content: newContent, title: editorTitle });
  };

  const handleBack = async () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Alterações não salvas',
        'Deseja salvar as alterações antes de sair?',
        [
          {
            text: 'Descartar',
            style: 'destructive',
            onPress: () => router.back(),
          },
          {
            text: 'Salvar',
            onPress: async () => {
              await saveNow();
              router.back();
            },
          },
        ]
      );
    } else {
      router.back();
    }
  };

  const getCurrentTitle = () => {
    if (!selectedType) return 'Selecione um capítulo';
    if (selectedType === 'chapter') return editorTitle;
    return CONTENT_TYPE_LABELS[selectedType];
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ThemedText>Carregando...</ThemedText>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
            <IconSymbol name="chevron.left" size={24} color={iconColor} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <ThemedText style={styles.headerTitle} numberOfLines={1}>
              {getCurrentTitle()}
            </ThemedText>
            <SaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
          </View>

          <TouchableOpacity
            onPress={saveNow}
            disabled={!hasUnsavedChanges}
            style={styles.headerButton}>
            <IconSymbol
              name="checkmark.circle.fill"
              size={24}
              color={hasUnsavedChanges ? primaryColor : iconColor}
            />
          </TouchableOpacity>
        </View>

        {/* Editor Area */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.editorContainer}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
          {selectedId ? (
            <>
              {/* Title Input (only for chapters) */}
              {selectedType === 'chapter' && (
                <View style={[styles.titleContainer, { borderBottomColor: borderColor }]}>
                  <TextInput
                    style={[styles.titleInput, { color: iconColor }]}
                    value={editorTitle}
                    onChangeText={handleTitleChange}
                    placeholder="Título do capítulo"
                    placeholderTextColor={placeholderColor}
                  />
                </View>
              )}

              {/* Content Editor */}
              <TextEditor value={editorContent} onChangeText={handleContentChange} />

              {/* Toolbar */}
              <Toolbar actions={FORMATTING_ACTIONS} onAction={handleFormattingAction} />
            </>
          ) : (
            <View style={styles.emptyEditor}>
              <IconSymbol name="books.vertical.fill" size={64} color={iconColor} />
              <ThemedText style={styles.emptyText}>
                Toque no botão abaixo para criar seu primeiro capítulo
              </ThemedText>
              <TouchableOpacity
                style={[styles.emptyButton, { backgroundColor: primaryColor }]}
                onPress={() => setShowNavigation(true)}>
                <ThemedText style={styles.emptyButtonText}>Abrir Navegação</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAvoidingView>

        {/* Floating Action Button */}
        <FloatingActionButton
          icon="books.vertical.fill"
          onPress={() => setShowNavigation(true)}
        />

        {/* Navigation Modal */}
        <NavigationModal
          visible={showNavigation}
          onClose={() => setShowNavigation(false)}
          chapters={chapters}
          contents={contents}
          selectedId={selectedId}
          selectedType={selectedType || 'chapter'}
          onSelectChapter={handleSelectChapter}
          onSelectContent={handleSelectContent}
          onAddChapter={handleAddChapter}
          onAddContent={handleAddContent}
          />

          {/* New Chapter Modal */}
          <Modal
            visible={showChapterModal}
            animationType="fade"
            transparent
            onRequestClose={() => setShowChapterModal(false)}>
            <TouchableOpacity
              style={styles.overlay}
              activeOpacity={1}
              onPress={() => setShowChapterModal(false)}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalContainer}>
                <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                  <ThemedView style={[styles.modal, { borderColor }]}>
                    <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
                      <ThemedText style={styles.modalTitle}>Novo Capítulo</ThemedText>
                      <TouchableOpacity onPress={() => setShowChapterModal(false)}>
                        <IconSymbol name="chevron.left" size={24} color={iconColor} />
                      </TouchableOpacity>
                    </View>
  
                    <View style={styles.modalContent}>
                      <Input
                        label="Título do Capítulo"
                        placeholder="Digite o título"
                        value={newChapterTitle}
                        onChangeText={setNewChapterTitle}
                        autoFocus
                        onSubmitEditing={handleCreateChapter}
                        returnKeyType="done"
                      />
                      <Button title="Criar Capítulo" onPress={handleCreateChapter} />
                    </View>
                  </ThemedView>
                </TouchableOpacity>
              </KeyboardAvoidingView>
            </TouchableOpacity>
          </Modal>
  
          {/* Content Type Selector */}
          <ContentTypeSelector
            visible={showContentSelector}
            onClose={() => setShowContentSelector(false)}
            onSelect={handleCreateContent}
            existingTypes={contents.map((c) => c.content_type)}
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
      borderBottomWidth: 1,
    },
    headerButton: {
      padding: Spacing.xs,
      minWidth: 40,
    },
    headerCenter: {
      flex: 1,
      alignItems: 'center',
      gap: 2,
      paddingHorizontal: Spacing.md,
    },
    headerTitle: {
      ...Typography.body,
      fontWeight: '600',
      textAlign: 'center',
    },
    editorContainer: {
      flex: 1,
    },
    titleContainer: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
    },
    titleInput: {
      ...Typography.h2,
      fontWeight: '600',
    },
    emptyEditor: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.xl,
      gap: Spacing.lg,
    },
    emptyText: {
      ...Typography.body,
      textAlign: 'center',
      opacity: 0.6,
    },
    emptyButton: {
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.sm,
    },
    emptyButtonText: {
      ...Typography.body,
      color: '#fff',
      fontWeight: '600',
    },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      width: '90%',
      maxWidth: 400,
    },
    modal: {
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      overflow: 'hidden',
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: Spacing.lg,
      borderBottomWidth: 1,
    },
    modalTitle: {
      ...Typography.h3,
      fontWeight: '600',
    },
    modalContent: {
      padding: Spacing.lg,
      gap: Spacing.md,
    },
  });