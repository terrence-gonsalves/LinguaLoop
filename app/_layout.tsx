import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TamaguiProvider, createTamagui } from 'tamagui';
import { config } from '@tamagui/config/v3'

const tamaguiConfig = createTamagui(config);

type Conf = typeof tamaguiConfig;
declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
};


export default function RootLayout() {
  return (
    <TamaguiProvider config={tamaguiConfig}>
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
