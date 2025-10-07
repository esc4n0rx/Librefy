// components/home/bestseller-carousel.tsx

import { ThemedText } from '@/components/themed-text';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useImageAuth } from '@/hooks/use-image-auth';
import { Book } from '@/types/book.types';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Image,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.5; // Card central maior
const CARD_HEIGHT = CARD_WIDTH * 1.5;
const SIDE_CARD_WIDTH = SCREEN_WIDTH * 0.35; // Cards laterais menores
const SIDE_CARD_HEIGHT = SIDE_CARD_WIDTH * 1.5;
const SPACING = Spacing.md;
const AUTO_ROTATE_INTERVAL = 5000;

interface BestsellerCarouselProps {
  books: Book[];
  onBookPress: (book: Book) => void;
}

export function BestsellerCarousel({ books, onBookPress }: BestsellerCarouselProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const autoRotateRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-rotate
  useEffect(() => {
    if (books.length <= 1) return;

    autoRotateRef.current = setInterval(() => {
      setActiveIndex((current) => {
        const nextIndex = (current + 1) % books.length;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
          viewPosition: 0.5,
        });
        return nextIndex;
      });
    }, AUTO_ROTATE_INTERVAL);

    return () => {
      if (autoRotateRef.current) {
        clearInterval(autoRotateRef.current);
      }
    };
  }, [books.length]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / (CARD_WIDTH + SPACING));
        setActiveIndex(index);

        // Reset auto-rotate
        if (autoRotateRef.current) {
          clearInterval(autoRotateRef.current);
        }
        autoRotateRef.current = setInterval(() => {
          setActiveIndex((current) => {
            const nextIndex = (current + 1) % books.length;
            flatListRef.current?.scrollToIndex({
              index: nextIndex,
              animated: true,
              viewPosition: 0.5,
            });
            return nextIndex;
          });
        }, AUTO_ROTATE_INTERVAL);
      },
    }
  );

  if (books.length === 0) return null;

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={books}
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + SPACING}
        snapToAlignment="center"
        contentContainerStyle={{
          paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2,
        }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => {
          const inputRange = [
            (index - 1) * (CARD_WIDTH + SPACING),
            index * (CARD_WIDTH + SPACING),
            (index + 1) * (CARD_WIDTH + SPACING),
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.7, 1, 0.7],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.5, 1, 0.5],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              style={[
                styles.cardWrapper,
                {
                  transform: [{ scale }],
                  opacity,
                },
              ]}>
              <BestsellerCard book={item} onPress={() => onBookPress(item)} />
            </Animated.View>
          );
        }}
      />

      {/* Page Indicators */}
      <View style={styles.indicators}>
        {books.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              {
                backgroundColor:
                  index === activeIndex
                    ? Colors[colorScheme].primary
                    : Colors[colorScheme].border,
                width: index === activeIndex ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

interface BestsellerCardProps {
  book: Book;
  onPress: () => void;
}

function BestsellerCard({ book, onPress }: BestsellerCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const borderColor = Colors[colorScheme].border;
  const textSecondary = Colors[colorScheme].textSecondary;

  const { authenticatedUrl, loading } = useImageAuth(book.cover_url);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.coverContainer, { backgroundColor: borderColor }]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={textSecondary} />
          </View>
        ) : authenticatedUrl ? (
          <Image source={{ uri: authenticatedUrl }} style={styles.cover} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderContainer}>
            <ThemedText style={styles.placeholderText}>📚</ThemedText>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <ThemedText style={styles.title} numberOfLines={2}>
          {book.title}
        </ThemedText>
        <ThemedText style={styles.author} numberOfLines={1}>
          {book.author?.full_name || 'Autor Desconhecido'}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginHorizontal: SPACING / 2,
  },
  card: {
    width: '100%',
  },
  coverContainer: {
    width: '100%',
    height: CARD_HEIGHT,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  cover: {
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
  placeholderText: {
    fontSize: 64,
  },
  info: {
    gap: 4,
    alignItems: 'center',
  },
  title: {
    ...Typography.body,
    fontWeight: '700',
    fontSize: 15,
    lineHeight: 18,
    textAlign: 'center',
  },
  author: {
    ...Typography.small,
    opacity: 0.7,
    fontSize: 13,
    textAlign: 'center',
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
  },
});