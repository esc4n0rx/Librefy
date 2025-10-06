import { AddToLibraryButton } from '@/components/books/add-to-library-button';
import { RatingStars } from '@/components/books/rating-stars';
import { ReviewCard } from '@/components/books/review-card';
import { Button } from '@/components/forms/button';
import { BookDetailSkeleton } from '@/components/skeletons/book-detail-skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AGE_RATINGS } from '@/constants/books';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/contexts/auth.context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useImageAuth } from '@/hooks/use-image-auth';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BookService } from '@/services/book.service';
import { DiscoverService } from '@/services/discover.service';
import { ReadingService } from '@/services/reading.service';
import { ReviewService } from '@/services/review.service';
import { Book } from '@/types/book.types';
import { BookReview, BookStats } from '@/types/review.types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
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

export default function BookDetailsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const iconColor = useThemeColor({}, 'icon');
  const backgroundColor = useThemeColor({}, 'background');
  const backgroundSecondary = useThemeColor({}, 'backgroundSecondary');
  const borderColor = Colors[colorScheme].border;
  const primaryColor = Colors[colorScheme].primary;
  const textSecondary = Colors[colorScheme].textSecondary;
  const placeholderColor = Colors[colorScheme].textSecondary;

  const [book, setBook] = useState<Book | null>(null);
  const [stats, setStats] = useState<BookStats | null>(null);
  const [reviews, setReviews] = useState<BookReview[]>([]);
  const [userReview, setUserReview] = useState<BookReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeTab, setActiveTab] = useState<'about' | 'reviews'>('about');

  const { authenticatedUrl: coverUrl, loading: coverLoading } = useImageAuth(
    book?.cover_url
  );
  const { authenticatedUrl: bannerUrl, loading: bannerLoading } = useImageAuth(
    book?.banner_url
  );

  useEffect(() => {
    if (id) {
      loadBookDetails();
    }
  }, [id]);

  const loadBookDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);

      const bookData = await DiscoverService.getBookDetails(id);
      setBook(bookData);

      await DiscoverService.incrementBookViews(id);

      const [statsData, reviewsData] = await Promise.all([
        ReviewService.getBookStats(id),
        ReviewService.getBookReviews(id, 1, 10),
      ]);

      setStats(statsData);
      setReviews(reviewsData);

      if (user) {
        const userReviewData = await ReviewService.getUserReview(user.id, id);
        setUserReview(userReviewData);
        if (userReviewData) {
          setReviewRating(userReviewData.rating);
          setReviewComment(userReviewData.comment);
        }
      }
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível carregar os detalhes do livro.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleReadBook = async () => {
    if (!book || !id) return;

    try {

      const chapters = await BookService.getBookChapters(id);

      if (chapters.length === 0) {
        Alert.alert('Aviso', 'Este livro ainda não possui capítulos disponíveis.');
        return;
      }

      let targetChapter = chapters[0];

      if (user) {
        try {
          const progress = await ReadingService.getProgress(user.id, id);
          if (progress && progress.chapter_id) {
            const savedChapter = chapters.find((ch) => ch.id === progress.chapter_id);
            if (savedChapter) {
              targetChapter = savedChapter;
            }
          }
        } catch (error) {
          console.log('Erro ao buscar progresso:', error);
        }
      }

      router.push(`/book/${id}/read/${targetChapter.id}` as any);
    } catch (error) {
      console.error('Erro ao carregar capítulos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os capítulos do livro.');
    }
  };

  const handleOpenReviewModal = () => {
    if (!user) {
      Alert.alert('Atenção', 'Você precisa estar logado para avaliar livros.');
      return;
    }
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (!user || !book) return;

    if (reviewComment.trim().length < 10) {
      Alert.alert('Atenção', 'O comentário deve ter no mínimo 10 caracteres.');
      return;
    }

    setSubmittingReview(true);
    try {
      await ReviewService.upsertReview(user.id, {
        book_id: book.id,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });

      Alert.alert('Sucesso', 'Avaliação enviada com sucesso!');
      setShowReviewModal(false);

      const [statsData, reviewsData, userReviewData] = await Promise.all([
        ReviewService.getBookStats(book.id),
        ReviewService.getBookReviews(book.id, 1, 10),
        ReviewService.getUserReview(user.id, book.id),
      ]);

      setStats(statsData);
      setReviews(reviewsData);
      setUserReview(userReviewData);
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível enviar a avaliação.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getAgeRatingLabel = (rating?: string) => {
    if (!rating) return 'Livre';
    const found = AGE_RATINGS.find((r) => r.value === rating);
    return found?.label || 'Livre';
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <BookDetailSkeleton />
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (!book) {
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color={iconColor} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Detalhes</ThemedText>
          <TouchableOpacity style={styles.backButton}>
            <IconSymbol name="bookmark.fill" size={24} color={iconColor} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {book.banner_url && (
            <View style={styles.bannerContainer}>
              {bannerLoading ? (
                <View style={styles.bannerLoading}>
                  <ActivityIndicator size="small" color={textSecondary} />
                </View>
              ) : bannerUrl ? (
                <Image
                  source={{ uri: bannerUrl }}
                  style={styles.banner}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.bannerPlaceholder, { backgroundColor: borderColor }]} />
              )}
            </View>
          )}

          <View style={styles.coverSection}>
            <View
              style={[
                styles.coverContainer,
                { backgroundColor: backgroundSecondary, borderColor },
              ]}>
              {coverLoading ? (
                <View style={styles.coverLoading}>
                  <ActivityIndicator size="small" color={textSecondary} />
                </View>
              ) : coverUrl ? (
                <Image
                  source={{ uri: coverUrl }}
                  style={styles.cover}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.coverPlaceholder}>
                  <ThemedText style={styles.coverPlaceholderText}>📚</ThemedText>
                </View>
              )}
            </View>
          </View>

          <View style={styles.infoSection}>
            <ThemedText style={styles.title}>{book.title}</ThemedText>

            <View style={styles.authorContainer}>
              <ThemedText style={styles.authorLabel}>por </ThemedText>
              <ThemedText style={styles.authorName}>
                {book.author?.full_name || 'Autor Desconhecido'}
              </ThemedText>
            </View>

            <View style={styles.ratingContainer}>
              <RatingStars
                rating={stats?.average_rating || 0}
                size={24}
              />
              <ThemedText style={styles.ratingText}>
                {stats?.average_rating.toFixed(1) || '0.0'}
              </ThemedText>
              <ThemedText style={styles.ratingCount}>
                ({stats?.total_ratings || 0} avaliações)
              </ThemedText>
            </View>

            <View style={styles.metadataContainer}>
              <View style={styles.metadataItem}>
                <IconSymbol name="books.vertical.fill" size={20} color={iconColor} />
                <ThemedText style={styles.metadataText}>
                  {book.total_chapters} capítulos
                </ThemedText>
              </View>
              <View style={styles.metadataItem}>
                <IconSymbol name="eye" size={20} color={iconColor} />
                <ThemedText style={styles.metadataText}>
                  {book.views_count.toLocaleString()} leituras
                </ThemedText>
              </View>
              {book.age_rating && (
                <View
                  style={[
                    styles.ageRatingBadge,
                    { backgroundColor: backgroundSecondary, borderColor },
                  ]}>
                  <ThemedText style={styles.ageRatingText}>
                    {getAgeRatingLabel(book.age_rating)}
                  </ThemedText>
                </View>
              )}
            </View>

            <View style={[styles.tabsContainer, { borderBottomColor: borderColor }]}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'about' && { borderBottomColor: primaryColor },
                ]}
                onPress={() => setActiveTab('about')}>
                <ThemedText
                  style={[
                    styles.tabText,
                    activeTab === 'about' && {
                      color: primaryColor,
                      fontWeight: '600',
                    },
                  ]}>
                  Sobre o livro
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'reviews' && { borderBottomColor: primaryColor },
                ]}
                onPress={() => setActiveTab('reviews')}>
                <ThemedText
                  style={[
                    styles.tabText,
                    activeTab === 'reviews' && {
                      color: primaryColor,
                      fontWeight: '600',
                    },
                  ]}>
                  Avaliações ({stats?.total_reviews || 0})
                </ThemedText>
              </TouchableOpacity>
            </View>

            {activeTab === 'about' ? (
              <View style={styles.tabContent}>
                {/* Synopsis */}
                {book.synopsis && (
                  <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Sinopse</ThemedText>
                    <ThemedText style={styles.synopsis}>{book.synopsis}</ThemedText>
                  </View>
                )}

                {book.categories && book.categories.length > 0 && (
                  <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Categorias</ThemedText>
                    <View style={styles.tagsContainer}>
                      {book.categories.map((category) => (
                        <View
                          key={category.id}
                          style={[
                            styles.tag,
                            { backgroundColor: backgroundSecondary, borderColor },
                          ]}>
                          {category.icon && (
                            <ThemedText style={styles.tagText}>
                              {category.icon}
                            </ThemedText>
                          )}
                          <ThemedText style={styles.tagText}>
                            {category.name}
                          </ThemedText>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {book.tags && book.tags.length > 0 && (
                  <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Tags</ThemedText>
                    <View style={styles.tagsContainer}>
                      {book.tags.map((tag, index) => (
                        <View
                          key={index}
                          style={[
                            styles.tag,
                            { backgroundColor: backgroundSecondary, borderColor },
                          ]}>
                          <ThemedText style={styles.tagText}>#{tag}</ThemedText>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.tabContent}>
                <TouchableOpacity
                  style={[styles.writeReviewButton, { backgroundColor: backgroundSecondary, borderColor }]}
                  onPress={handleOpenReviewModal}>
                  <IconSymbol name="paperplane.fill" size={20} color={primaryColor} />
                  <ThemedText style={[styles.writeReviewText, { color: primaryColor }]}>
                    {userReview ? 'Editar minha avaliação' : 'Escrever avaliação'}
                  </ThemedText>
                </TouchableOpacity>

                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))
                ) : (
                  <View style={styles.emptyReviews}>
                    <IconSymbol name="paperplane.fill" size={48} color={textSecondary} />
                    <ThemedText style={styles.emptyReviewsText}>
                      Nenhuma avaliação ainda
                    </ThemedText>
                    <ThemedText style={styles.emptyReviewsSubtext}>
                      Seja o primeiro a avaliar este livro!
                    </ThemedText>
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>

        <View style={[styles.footer, { borderBottomColor: borderColor }]}>
          <View style={styles.footerButtons}>
            <Button
              title="Ler"
              onPress={handleReadBook}
              style={styles.readButton}
            />
            <AddToLibraryButton bookId={book.id} />
          </View>
        </View>

        <Modal
          visible={showReviewModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowReviewModal(false)}>
          <ThemedView style={styles.modalContainer}>
            <SafeAreaView style={styles.modalSafeArea}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalKeyboardView}>
                <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
                  <TouchableOpacity
                    onPress={() => setShowReviewModal(false)}
                    disabled={submittingReview}>
                    <IconSymbol name="chevron.left" size={24} color={iconColor} />
                  </TouchableOpacity>
                  <ThemedText style={styles.modalTitle}>
                    {userReview ? 'Editar Avaliação' : 'Nova Avaliação'}
                  </ThemedText>
                  <View style={{ width: 24 }} />
                </View>

                <ScrollView
                  style={styles.modalContent}
                  contentContainerStyle={styles.modalScrollContent}
                  keyboardShouldPersistTaps="handled">
                  <View style={styles.modalSection}>
                    <ThemedText style={styles.modalSectionTitle}>
                      Sua Avaliação
                    </ThemedText>
                    <View style={styles.modalRatingContainer}>
                      <RatingStars
                        rating={reviewRating}
                        size={36}
                        interactive
                        onRatingChange={setReviewRating}
                      />
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <ThemedText style={styles.modalSectionTitle}>
                      Comentário (opcional)
                    </ThemedText>
                    <TextInput
                      style={[
                        styles.commentInput,
                        {
                          backgroundColor: backgroundSecondary,
                          borderColor,
                          color: iconColor,
                        },
                      ]}
                      placeholder="Compartilhe sua opinião sobre o livro..."
                      placeholderTextColor={placeholderColor}
                      value={reviewComment}
                      onChangeText={setReviewComment}
                      multiline
                      numberOfLines={6}
                      maxLength={500}
                      textAlignVertical="top"
                      editable={!submittingReview}
                    />
                    <ThemedText style={styles.commentCounter}>
                      {reviewComment.length}/500
                    </ThemedText>
                  </View>

                  <Button
                    title={userReview ? 'Atualizar Avaliação' : 'Enviar Avaliação'}
                    onPress={handleSubmitReview}
                    loading={submittingReview}
                    disabled={submittingReview}
                  />
                </ScrollView>
              </KeyboardAvoidingView>
            </SafeAreaView>
          </ThemedView>
        </Modal>
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
    borderBottomWidth: 1,
  },
  backButton: {
    padding: Spacing.xs,
    minWidth: 40,
  },
  headerTitle: {
    ...Typography.h3,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  bannerContainer: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  banner: {
    width: '100%',
    height: '100%',
  },
  bannerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerPlaceholder: {
    width: '100%',
    height: '100%',
  },
  coverSection: {
    alignItems: 'center',
    marginTop: -80,
    marginBottom: Spacing.lg,
  },
  coverContainer: {
    width: 140,
    height: 200,
    borderRadius: BorderRadius.md,
    borderWidth: 3,
    overflow: 'hidden',
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  coverLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverPlaceholderText: {
    fontSize: 64,
  },
  infoSection: {
    paddingHorizontal: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  authorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  authorLabel: {
    ...Typography.body,
    opacity: 0.6,
  },
  authorName: {
    ...Typography.body,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  ratingText: {
    ...Typography.h3,
    fontWeight: '700',
  },
  ratingCount: {
    ...Typography.body,
    opacity: 0.6,
  },
  metadataContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs / 2,
  },
  metadataText: {
    ...Typography.small,
    opacity: 0.7,
  },
  ageRatingBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  ageRatingText: {
    ...Typography.small,
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: Spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    ...Typography.body,
  },
  tabContent: {
    gap: Spacing.lg,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.h4,
    fontWeight: '600',
  },
  synopsis: {
    ...Typography.body,
    lineHeight: 22,
    opacity: 0.8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.xs / 2,
  },
  tagText: {
    ...Typography.small,
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    gap: Spacing.sm,
  },
  writeReviewText: {
    ...Typography.body,
    fontWeight: '600',
  },
  emptyReviews: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.md,
  },
  emptyReviewsText: {
    ...Typography.body,
    fontWeight: '600',
  },
  emptyReviewsSubtext: {
    ...Typography.small,
    opacity: 0.6,
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  footerButtons: {
    gap: Spacing.sm,
  },
  readButton: {
    marginBottom: 0,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalSafeArea: {
    flex: 1,
  },
  modalKeyboardView: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  modalTitle: {
    ...Typography.h3,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
  },
  modalScrollContent: {
    padding: Spacing.lg,
    gap: Spacing.xl,
  },
  modalSection: {
    gap: Spacing.md,
  },
  modalSectionTitle: {
    ...Typography.h4,
    fontWeight: '600',
  },
  modalRatingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  commentInput: {
    ...Typography.body,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    padding: Spacing.md,
    minHeight: 120,
  },
  commentCounter: {
    ...Typography.small,
    textAlign: 'right',
    opacity: 0.6,
  },
});