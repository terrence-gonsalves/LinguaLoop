import { Stack } from "expo-router";
import "'@/global.css'";
import { GluestackUIProvider } from "@/'components/ui'/gluestack-ui-provider";
import { StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <GluestackUIProvider mode="light"><ThemeProvider value={DefaultTheme}>
        <StatusBar style="auto" />
        <SafeAreaView style={styles.wrapper}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </SafeAreaView>
      </ThemeProvider></GluestackUIProvider>
  );
}

const styles = StyleSheet.create({  
  wrapper: {
    flex: 1,
  },
});
