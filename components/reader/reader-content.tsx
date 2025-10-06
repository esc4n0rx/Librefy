import { ReadingThemes } from '@/constants/theme';
import { ReaderSettings } from '@/types/reader.types';
import React, { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

interface ReaderContentProps {
  content: string;
  settings: ReaderSettings;
  initialScrollPosition?: number;
  onScroll: (position: number) => void;
}

export function ReaderContent({
  content,
  settings,
  initialScrollPosition = 0,
  onScroll,
}: ReaderContentProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const contentHeight = useRef(0);
  const scrollViewHeight = useRef(0);

  const theme = ReadingThemes[settings.theme];

  useEffect(() => {
    // Restaurar posição de scroll após o layout
    if (initialScrollPosition > 0 && scrollViewHeight.current > 0) {
      const scrollY = (initialScrollPosition / 100) * contentHeight.current;
      scrollViewRef.current?.scrollTo({ y: scrollY, animated: false });
    }
  }, [initialScrollPosition, contentHeight.current]);

  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    
    contentHeight.current = contentSize.height;
    scrollViewHeight.current = layoutMeasurement.height;

    // Calcular progresso (0-100)
    const maxScroll = contentSize.height - layoutMeasurement.height;
    const progress = maxScroll > 0 ? (contentOffset.y / maxScroll) * 100 : 0;

    onScroll(Math.min(100, Math.max(0, progress)));
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      onScroll={handleScroll}
      scrollEventThrottle={100}>
      <Text
        style={[
          styles.text,
          {
            color: theme.text,
            fontSize: settings.fontSize,
            lineHeight: settings.fontSize * settings.lineHeight,
            fontFamily: settings.fontFamily === 'serif' ? 'serif' : 'system',
          },
        ]}>
        {content}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  text: {
    textAlign: 'justify',
  },
});