import { Stack } from "expo-router";
import { StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from "react-native-safe-area-context";
import { TamaguiProvider } from 'tamagui';
import { useColorScheme } from "@/components/useColorScheme";

export default function RootLayout() {

  return (
    <TamaguiProvider>
      <StatusBar style="auto" />
      <SafeAreaView style={styles.wrapper}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </SafeAreaView>
    </TamaguiProvider>
  );
}

const styles = StyleSheet.create({  
  wrapper: {
    flex: 1,
  },
});
