// components/books/add-to-library-button.tsx

import { Button } from '@/components/forms/button';
import { useAuth } from '@/contexts/auth.context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BookService } from '@/services/book.service';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

interface AddToLibraryButtonProps {
  bookId: string;
  onLibraryChange?: (isInLibrary: boolean) => void;
}

export function AddToLibraryButton({
  bookId,
  onLibraryChange,
}: AddToLibraryButtonProps) {
  const { user } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const [isInLibrary, setIsInLibrary] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    checkLibraryStatus();
  }, [bookId, user]);

  const checkLibraryStatus = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const status = await BookService.isInLibrary(user.id, bookId);
      setIsInLibrary(status);
      onLibraryChange?.(status);
    } catch (error) {
      console.error('Erro ao verificar biblioteca:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLibrary = async () => {
    if (!user) {
      Alert.alert('Atenção', 'Você precisa estar logado para adicionar livros à biblioteca.');
      return;
    }

    setActionLoading(true);
    try {
      if (isInLibrary) {
        await BookService.removeFromLibrary(user.id, bookId);
        setIsInLibrary(false);
        onLibraryChange?.(false);
        Alert.alert('Sucesso', 'Livro removido da biblioteca.');
      } else {
        await BookService.addToLibrary(user.id, bookId);
        setIsInLibrary(true);
        onLibraryChange?.(true);
        Alert.alert('Sucesso', 'Livro adicionado à biblioteca!');
      }
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível atualizar a biblioteca.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <View style={styles.placeholder} />;
  }

  return (
    <Button
      title={isInLibrary ? 'Remover da Biblioteca' : 'Adicionar à Biblioteca'}
      variant={isInLibrary ? 'outline' : 'primary'}
      onPress={handleToggleLibrary}
      loading={actionLoading}
      disabled={actionLoading}
    />
  );
}

const styles = StyleSheet.create({
  placeholder: {
    height: 48,
  },
});