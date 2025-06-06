import { Stack } from "expo-router/stack";
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import AuthProvider from './providers/auth-provider';
import { ThemeProvider } from './providers/theme-provider';

// configure splash screen
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some race conditions, ignore them */
});

// configure splash screen to show only the logo
SplashScreen.hideAsync().catch(() => {
  /* ignore errors */
});

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {

        // add any initialization logic here
        await new Promise(resolve => setTimeout(resolve, 1000)); // ensure splash screen shows for at least 1 second
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
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
