import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../app/providers/theme-provider';

interface AchievementItemProps {
  title: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  progress: number;
  isCompleted?: boolean;
  date?: string;
}

export function AchievementItem({ 
  title, 
  description, 
  icon, 
  progress, 
  isCompleted = false,
  date = 'October 2023'
}: AchievementItemProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons 
          name={icon} 
          size={24} 
          color={isCompleted ? Colors.light.rust : Colors.light.textSecondary} 
        />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.date}>{date}</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
        <Text style={styles.description}>{description}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.generalBG,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  description: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.light.generalBG,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.rust,
    borderRadius: 2,
  },
}); 