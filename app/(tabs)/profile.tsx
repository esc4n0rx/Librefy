// app/(tabs)/profile.tsx
import { Button } from '@/components/forms/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth.context';
import { StyleSheet, View } from 'react-native';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title">Perfil</ThemedText>
        <ThemedText style={styles.subtitle}>
          Olá, {user?.email || 'Usuário'}
        </ThemedText>
        <ThemedText style={styles.description}>
          Em breve você poderá gerenciar seu perfil e preferências.
        </ThemedText>
        <Button title="Sair" onPress={signOut} variant="outline" />
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
  subtitle: {
    fontSize: 18,
    opacity: 0.8,
  },
  description: {
    textAlign: 'center',
    opacity: 0.6,
    marginBottom: Spacing.lg,
  },
});