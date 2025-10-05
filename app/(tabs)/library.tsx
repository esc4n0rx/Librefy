// app/(tabs)/library.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { StyleSheet, View } from 'react-native';

export default function LibraryScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title">Biblioteca</ThemedText>
        <ThemedText style={styles.description}>
          Em breve você poderá acessar sua biblioteca pessoal de livros.
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  description: {
    textAlign: 'center',
    opacity: 0.6,
  },
});