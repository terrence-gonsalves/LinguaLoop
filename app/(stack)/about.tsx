import Colors from '@/constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Link } from 'expo-router/build/link/Link';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SettingsSection } from '../../components/settings/SettingsSection';

const tools = [
  {
    name: 'Expo',
    description: 'Framework and platform for universal React applications',
    icon: 'extension',
  },
  {
    name: 'Supabase',
    description: 'Open source Firebase alternative for backend and authentication',
    icon: 'storage',
  },
  {
    name: 'Cursor',
    description: 'AI-powered code editor used for development',
    icon: 'code',
  },
  {
    name: 'Visily',
    description: 'Design and prototyping tool used for UI/UX',
    icon: 'palette',
  },
];

export default function AboutScreen() {
  const version = Constants.expoConfig?.version || '0.0.0';
  const buildNumber = Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode?.toString() || '1';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <SettingsSection title="App Information">
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>{version}</Text>
          </View>
          <View style={[styles.infoItem, styles.lastItem]}>
            <Text style={styles.infoLabel}>Build Number</Text>
            <Text style={styles.infoValue}>{buildNumber}</Text>
          </View>
        </SettingsSection>

        <SettingsSection title="Acknowledgements">
          {tools.map((tool, index) => (
            <View 
              key={tool.name} 
              style={[
                styles.toolItem,
                index === tools.length - 1 && styles.lastItem
              ]}
            >
              <View style={styles.toolHeader}>
                <View style={styles.iconContainer}>
                  <MaterialIcons name={tool.icon as any} size={24} color={Colors.light.text} />
                </View>
                <Text style={styles.toolName}>{tool.name}</Text>
              </View>
              <Text style={styles.toolDescription}>{tool.description}</Text>
            </View>
          ))}
        </SettingsSection>

        <SettingsSection title="Legal">
          <Link href="../terms" asChild>
            <Pressable style={styles.legalItem}>
              <Text style={styles.legalText}>Terms & Conditions</Text>
              <MaterialIcons name="chevron-right" size={24} color={Colors.light.textSecondary} />
            </Pressable>
          </Link>
          <Link href="../privacy" asChild>
            <Pressable style={styles.lastItem}>
              <Text style={styles.legalText}>Privacy Policy</Text>
              <MaterialIcons name="chevron-right" size={24} color={Colors.light.textSecondary} />
            </Pressable>
          </Link>
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.generalBG,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  infoLabel: {
    fontSize: 16,
    color: Colors.light.text,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  toolItem: {
    padding: 16,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  toolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  iconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  toolName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  toolDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginLeft: 44, // 32 (icon width) + 12 (margin)
  },
  lastItem: {
    borderBottomWidth: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.light.background,
  },
  legalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  legalText: {
    fontSize: 16,
    color: Colors.light.text,
  },
}); 