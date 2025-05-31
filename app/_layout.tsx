import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { View } from "react-native";

export default function RootLayout() {
  return (
    <View>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </View>
  );
}
