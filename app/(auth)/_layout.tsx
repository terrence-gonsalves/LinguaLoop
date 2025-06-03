import { useAuth } from '@/lib/auth-context';
import { Stack, router } from 'expo-router';
import { useEffect } from 'react';

export default function AuthLayout() {
  const { session, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && session) {
      // Redirect to dashboard if already authenticated
      router.replace('/(tabs)');
    }
  }, [session, isLoading]);

  // Don't render anything while checking auth state
  if (isLoading) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="create-account" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
} 