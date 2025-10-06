// components/books/book-form-modal.tsx

import { Button } from '@/components/forms/button';
import { Input } from '@/components/forms/input';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AGE_RATINGS, MAX_CATEGORIES_PER_BOOK, MAX_FILE_SIZE, MAX_TAGS_PER_BOOK } from '@/constants/books';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/contexts/auth.context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BookService } from '@/services/book.service';
import { AgeRating, BookCategory } from '@/types/book.types';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface BookFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BookFormModal({ visible, onClose, onSuccess }: BookFormModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const iconColor = useThemeColor({}, 'icon');
  const backgroundColor = useThemeColor({}, 'background');
  const backgroundSecondary = useThemeColor({}, 'backgroundSecondary');
  const borderColor = Colors[colorScheme].border;
  const primaryColor = Colors[colorScheme].primary;
  const placeholderColor = Colors[colorScheme].textSecondary;

  // Form state
  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [ageRating, setAgeRating] = useState<AgeRating>('livre');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);
  const [bannerImage, setBannerImage] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);

  // Data state
  const [categories, setCategories] = useState<BookCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load categories
  useEffect(() => {
    if (visible) {
      loadCategories();
    }
  }, [visible]);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const data = await BookService.getCategories();
      setCategories(data);
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível carregar as categorias.');
    } finally {
      setLoadingCategories(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Título é obrigatório';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Título deve ter no mínimo 3 caracteres';
    }

    if (selectedCategories.length === 0) {
      newErrors.categories = 'Selecione pelo menos uma categoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePickImage = async (type: 'cover' | 'banner') => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos de acesso à galeria para selecionar imagens.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'cover' ? [2, 3] : [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Validar tamanho
        if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
          Alert.alert('Arquivo muito grande', 'A imagem deve ter no máximo 5MB.');
          return;
        }

        const imageData = {
          uri: asset.uri,
          name: `${type}-${Date.now()}.jpg`,
          type: 'image/jpeg',
        };

        if (type === 'cover') {
          setCoverImage(imageData);
        } else {
          setBannerImage(imageData);
        }
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        if (prev.length >= MAX_CATEGORIES_PER_BOOK) {
          Alert.alert('Limite atingido', `Você pode selecionar no máximo ${MAX_CATEGORIES_PER_BOOK} categorias.`);
          return prev;
        }
        return [...prev, categoryId];
      }
    });
    
    // Limpar erro de categorias
    if (errors.categories) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.categories;
        return newErrors;
      });
    }
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    
    if (!trimmedTag) return;

    if (tags.length >= MAX_TAGS_PER_BOOK) {
      Alert.alert('Limite atingido', `Você pode adicionar no máximo ${MAX_TAGS_PER_BOOK} tags.`);
      return;
    }

    if (tags.includes(trimmedTag)) {
      Alert.alert('Tag duplicada', 'Esta tag já foi adicionada.');
      return;
    }

    setTags((prev) => [...prev, trimmedTag]);
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSubmit = async () => {
    if (!validateForm() || !user) return;

    setLoading(true);
    try {
      const book = await BookService.createBook(user.id, {
        title: title.trim(),
        synopsis: synopsis.trim() || undefined,
        age_rating: ageRating,
        category_ids: selectedCategories,
        tags,
        cover_file: coverImage || undefined,
        banner_file: bannerImage || undefined,
      });

      Alert.alert(
        'Livro criado!',
        'Seu livro foi criado com sucesso. Comece a escrever agora!',
        [
          {
            text: 'OK',
            onPress: () => {
              resetForm();
              onClose();
              onSuccess?.();
              // Navegar para o editor
              router.push(`/book/${book.id}/editor` as any);
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Erro ao criar livro', error.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setSynopsis('');
    setAgeRating('livre');
    setSelectedCategories([]);
    setTags([]);
    setTagInput('');
    setCoverImage(null);
    setBannerImage(null);
    setErrors({});
  };

  const handleClose = () => {
    if (title || synopsis || selectedCategories.length > 0) {
      Alert.alert(
        'Descartar alterações?',
        'Você tem alterações não salvas. Deseja realmente fechar?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Descartar',
            style: 'destructive',
            onPress: () => {
              resetForm();
              onClose();
            },
          },
        ]
      );
    } else {
      resetForm();
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: borderColor }]}>
            <TouchableOpacity onPress={handleClose} disabled={loading}>
              <IconSymbol name="chevron.left" size={24} color={iconColor} />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Criar Livro</ThemedText>
            <View style={{ width: 24 }} />
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              {/* Title */}
              <Input
                label="Título do Livro *"
                placeholder="Digite o título"
                value={title}
                onChangeText={setTitle}
                error={errors.title}
                maxLength={100}
                editable={!loading}
              />

              {/* Synopsis */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Sinopse</ThemedText>
                <TextInput
                  style={[
                    styles.textArea,
                    {
                      backgroundColor: backgroundSecondary,
                      borderColor,
                      color: iconColor,
                    },
                  ]}
                  placeholder="Descreva sua história..."
                  placeholderTextColor={placeholderColor}
                  value={synopsis}
                  onChangeText={setSynopsis}
                  multiline
                  numberOfLines={5}
                  maxLength={500}
                  textAlignVertical="top"
                  editable={!loading}
                />
                <ThemedText style={styles.helperText}>
                  {synopsis.length}/500 caracteres
                </ThemedText>
              </View>

              {/* Age Rating */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Faixa Etária</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.chipContainer}>
                    {AGE_RATINGS.map((rating) => (
                      <TouchableOpacity
                        key={rating.value}
                        style={[
                          styles.chip,
                          { backgroundColor: backgroundSecondary, borderColor },
                          ageRating === rating.value && {
                            backgroundColor: primaryColor,
                            borderColor: primaryColor,
                          },
                        ]}
                        onPress={() => setAgeRating(rating.value)}
                        disabled={loading}>
                        <ThemedText
                          style={[
                            styles.chipText,
                            ageRating === rating.value && styles.chipTextActive,
                          ]}>
                          {rating.label}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Categories */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>
                  Categorias * (até {MAX_CATEGORIES_PER_BOOK})
                </ThemedText>
                {loadingCategories ? (
                  <ThemedText style={styles.helperText}>Carregando categorias...</ThemedText>
                ) : (
                  <View style={styles.chipContainer}>
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.chip,
                          { backgroundColor: backgroundSecondary, borderColor },
                          selectedCategories.includes(category.id) && {
                            backgroundColor: primaryColor,
                            borderColor: primaryColor,
                          },
                        ]}
                        onPress={() => toggleCategory(category.id)}
                        disabled={loading}>
                        {category.icon && (
                          <ThemedText
                            style={[
                              styles.chipText,
                              selectedCategories.includes(category.id) && styles.chipTextActive,
                            ]}>
                            {category.icon}
                          </ThemedText>
                        )}
                        <ThemedText
                          style={[
                            styles.chipText,
                            selectedCategories.includes(category.id) && styles.chipTextActive,
                          ]}>
                          {category.name}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                {errors.categories && (
                  <ThemedText style={[styles.helperText, { color: Colors[colorScheme].error }]}>
                    {errors.categories}
                  </ThemedText>
                )}
              </View>

              {/* Tags */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>
                  Tags (até {MAX_TAGS_PER_BOOK})
                </ThemedText>
                <View style={styles.tagInputContainer}>
                  <TextInput
                    style={[
                      styles.tagInput,
                      {
                        backgroundColor: backgroundSecondary,
                        borderColor,
                        color: iconColor,
                      },
                    ]}
                    placeholder="Digite uma tag e pressione +"
                    placeholderTextColor={placeholderColor}
                    value={tagInput}
                    onChangeText={setTagInput}
                    onSubmitEditing={addTag}
                    returnKeyType="done"
                    maxLength={20}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={[styles.addTagButton, { backgroundColor: primaryColor }]}
                    onPress={addTag}
                    disabled={loading || !tagInput.trim()}>
                    <ThemedText style={styles.addTagText}>+</ThemedText>
                  </TouchableOpacity>
                </View>
                {tags.length > 0 && (
                  <View style={styles.chipContainer}>
                    {tags.map((tag, index) => (
                      <View
                        key={index}
                        style={[
                          styles.chip,
                          { backgroundColor: backgroundSecondary, borderColor },
                        ]}>
                        <ThemedText style={styles.chipText}>{tag}</ThemedText>
                        <TouchableOpacity onPress={() => removeTag(tag)} disabled={loading}>
                          <IconSymbol name="chevron.left" size={14} color={iconColor} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Cover Image */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Capa</ThemedText>
                <TouchableOpacity
                  style={[
                    styles.imagePicker,
                    { backgroundColor: backgroundSecondary, borderColor },
                  ]}
                  onPress={() => handlePickImage('cover')}
                  disabled={loading}>
                  {coverImage ? (
                    <Image source={{ uri: coverImage.uri }} style={styles.imagePreview} />
                  ) : (
                    <>
                      <IconSymbol name="books.vertical.fill" size={32} color={iconColor} />
                      <ThemedText style={styles.imagePickerText}>
                        Adicionar capa (2:3)
                      </ThemedText>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Banner Image */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Banner</ThemedText>
                <TouchableOpacity
                  style={[
                    styles.imagePicker,
                    styles.bannerPicker,
                    { backgroundColor: backgroundSecondary, borderColor },
                  ]}
                  onPress={() => handlePickImage('banner')}
                  disabled={loading}>
                  {bannerImage ? (
                    <Image source={{ uri: bannerImage.uri }} style={styles.bannerPreview} />
                  ) : (
                    <>
                      <IconSymbol name="books.vertical.fill" size={32} color={iconColor} />
                      <ThemedText style={styles.imagePickerText}>
                        Adicionar banner (16:9)
                      </ThemedText>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Submit Button */}
              <Button
                title="Criar e Começar a Escrever"
                onPress={handleSubmit}
                loading={loading}
                disabled={loading}
              />

              <View style={{ height: Spacing.xl }} />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ThemedView>
    </Modal>
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
    borderBottomWidth: 1,
  },
  headerTitle: {
    ...Typography.h3,
    fontWeight: '600',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.body,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  textArea: {
    ...Typography.body,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    padding: Spacing.md,
    minHeight: 120,
  },
  helperText: {
    ...Typography.small,
    opacity: 0.6,
    marginTop: Spacing.xs,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: Spacing.xs / 2,
  },
  chipText: {
    ...Typography.body,
    fontSize: 13,
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  tagInputContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  tagInput: {
    flex: 1,
    ...Typography.body,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  addTagButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTagText: {
    ...Typography.h2,
    color: '#fff',
    fontWeight: '600',
  },
  imagePicker: {
    height: 200,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    gap: Spacing.xs,
  },
  bannerPicker: {
    height: 120,
  },
  imagePickerText: {
    ...Typography.body,
    opacity: 0.6,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});