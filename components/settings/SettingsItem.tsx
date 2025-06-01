import { Colors } from '@/constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface SettingsItemProps {
  icon: React.ReactNode;
  title: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

export function SettingsItem({ icon, title, onPress, rightElement }: SettingsItemProps) {
  return (
    <Pressable 
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed
      ]}
      onPress={onPress}
    >
      <View style={styles.leftContent}>
        <View style={styles.iconContainer}>
          {icon}
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>
      {rightElement ? (
        rightElement
      ) : (
        <MaterialCommunityIcons 
          name="chevron-right" 
          size={20} 
          color={Colors.light.textSecondary} 
        />
      )}
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
  },
  pressed: {
    opacity: 0.7,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    color: Colors.light.textPrimary,
  },
}); 