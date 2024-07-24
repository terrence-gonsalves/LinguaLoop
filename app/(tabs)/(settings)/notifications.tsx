import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.wrapper}>
        <ThemedView style={styles.titleContainer}>
            <ThemedText type="title">Welcome!</ThemedText>
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
            <ThemedText type="subtitle">Notifications Screen</ThemedText>
        </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
        justifyContent: "center",
        alignItems: "center",
  },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    stepContainer: {
      gap: 8,
      marginBottom: 8,
    }
  });