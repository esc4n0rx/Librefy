// components/profile/avatar-picker.tsx

import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useImageAuth } from '@/hooks/use-image-auth';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

interface AvatarPickerProps {
  currentAvatarUrl?: string;
  onAvatarSelected: (file: { uri: string; name: string; type: string }) => void;
  size?: number;
  editable?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function AvatarPicker({
  currentAvatarUrl,
  onAvatarSelected,
  size = 120,
  editable = true,
}: AvatarPickerProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const borderColor = Colors[colorScheme].border;
  const primaryColor = Colors[colorScheme].primary;
  const iconColor = Colors[colorScheme].icon;

  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const { authenticatedUrl, loading } = useImageAuth(
    localImageUri || currentAvatarUrl,
    { enabled: !localImageUri }
  );

  const handlePickImage = async () => {
    if (!editable) return;

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permissão negada',
          'Precisamos de acesso à galeria para selecionar uma foto.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
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
          name: `avatar-${Date.now()}.jpg`,
          type: 'image/jpeg',
        };

        setLocalImageUri(asset.uri);
        onAvatarSelected(imageData);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  const displayUri = localImageUri || authenticatedUrl;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { width: size, height: size, borderColor },
      ]}
      onPress={handlePickImage}
      disabled={!editable}
      activeOpacity={editable ? 0.7 : 1}>
      {loading && !localImageUri ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={iconColor} />
        </View>
      ) : displayUri ? (
        <Image source={{ uri: displayUri }} style={styles.image} />
      ) : (
        <View style={styles.placeholder}>
          <IconSymbol name="person.fill" size={size * 0.5} color={iconColor} />
        </View>
      )}

      {editable && (
        <View style={[styles.editBadge, { backgroundColor: primaryColor }]}>
          <IconSymbol name="paperplane.fill" size={16} color="#fff" />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.full,
    borderWidth: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundSecondary,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
});