import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../app/providers/theme-provider';

interface SettingsItemProps {
  icon: React.ReactNode;
  title: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  subtitle?: string;
}

export function SettingsItem({ icon, title, subtitle, onPress, rightElement }: SettingsItemProps) {
  return (
    <Pressable 
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.leftContent}>
        <View style={styles.iconContainer}>
          {icon}
        </View>
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement ? (
        rightElement
      ) : onPress ? (
        <MaterialCommunityIcons 
          name="chevron-right" 
          size={20} 
          color={Colors.light.textSecondary} 
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    marginBottom: 8,
  },
  pressed: {
    opacity: 0.7,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.generalBG,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
}); 