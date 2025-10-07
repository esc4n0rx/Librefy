// app/(auth)/_layout.tsx
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: Colors[colorScheme].background,
        },
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="create-profile" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="verification" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}