import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../app/providers/theme-provider';

export default function TestSettingsScreen() {
  console.log('Rendering Test Settings Screen'); // Debug log

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5', // Fallback color if Colors is undefined
    },
    content: {
      flex: 1,
      padding: 16,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '600',
      color: '#000000', // Fallback color if Colors is undefined
      marginBottom: 24,
    },
  });

  try {
    return (
      <SafeAreaView style={[styles.container, Colors?.light?.generalBG && { backgroundColor: Colors.light.generalBG }]}>
        <View style={styles.content}>
          <Text style={[styles.headerTitle, Colors?.light?.textPrimary && { color: Colors.light.textPrimary }]}>
            Test Settings
          </Text>
          <Text>This is a test settings screen</Text>
        </View>
      </SafeAreaView>
    );
  } catch (error) {
    console.log('Error rendering TestSettingsScreen:', error);
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.headerTitle}>Test Settings</Text>
          <Text>This is a test settings screen</Text>
        </View>
      </SafeAreaView>
    );
  }
} 