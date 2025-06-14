import { useAuth } from '@/lib/auth-context';
import { router } from 'expo-router';
import { Stack } from 'expo-router/stack';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Colors } from '../providers/theme-provider';

export default function AuthLayout() {
  const { session, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && session) {

      // redirect to dashboard if already authenticated
      router.replace('/(tabs)');
    }
  }, [session, isLoading]);

  return (
    <>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.rust} />
        </View>
      ) : (
        <Stack
          screenOptions={{
            headerShown: false,

            // add animation config to make transitions smoother
            animation: 'slide_from_right',

            // prevent gesture-based dismissal which can cause blank screens
            gestureEnabled: false,

            // ensure screens are always mounted
            presentation: 'card',
          }}
        >
          <Stack.Screen 
            name="login" 
            options={{

              // prevent this screen from being removed from stack
              gestureEnabled: false,
            }}
          />
          <Stack.Screen 
            name="create-account"
            options={{
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen 
            name="forgot-password"
            options={{
              animation: 'slide_from_right',
            }}
          />
        </Stack>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.generalBG,
  },
}); 