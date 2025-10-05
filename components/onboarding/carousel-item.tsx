// components/onboarding/carousel-item.tsx
import { ThemedText } from '@/components/themed-text';
import { OnboardingSlide } from '@/constants/onboarding';
import { Spacing, Typography } from '@/constants/theme';
import LottieView from 'lottie-react-native';
import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

interface CarouselItemProps {
  item: OnboardingSlide;
}

export function CarouselItem({ item }: CarouselItemProps) {
  const { width } = useWindowDimensions();

  return (
    <View style={[styles.container, { width }]}>
      <View style={styles.animationContainer}>
        <LottieView
          source={require('@/assets/reading.json')}
          autoPlay
          loop
          style={styles.animation}
        />
      </View>
      <View style={styles.contentContainer}>
        <ThemedText style={styles.title}>{item.title}</ThemedText>
        <ThemedText style={styles.description}>{item.description}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  animationContainer: {
    width: '100%',
    height: 250,
    marginBottom: Spacing.xl,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  title: {
    ...Typography.h1,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  description: {
    ...Typography.body,
    textAlign: 'center',
    opacity: 0.7,
  },
});