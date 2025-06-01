import { VersionDisplay } from '@/components/common/VersionDisplay';
import { Colors } from '@/constants/Colors';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.headerTitle}>Settings</Text>
        
        {/* Add your settings options here */}
        
        {/* Version display at the bottom */}
        <View style={styles.footer}>
          <VersionDisplay showBuildNumber />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.generalBG,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: 24,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: 16,
  },
}); 