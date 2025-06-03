import Colors from '@/constants/Colors';
import { StyleSheet, Text, View } from 'react-native';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: 8,
  },
  content: {
    borderRadius: 12,
    backgroundColor: Colors.light.background,
    overflow: 'hidden',
  },
}); 