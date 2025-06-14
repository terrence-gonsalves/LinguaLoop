import { Stack } from "expo-router/stack";
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import AuthProvider from './providers/auth-provider';
import { ThemeProvider } from './providers/theme-provider';

// keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some race conditions, ignore them */
});

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {

        // add initialization logic here
        // for example, loading fonts, making API calls, etc.
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.error('Error loading app resources:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        // ignore errors
      }
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(stack)" />
          </Stack>
        </View>
      </AuthProvider>
    </ThemeProvider>
  );
}
