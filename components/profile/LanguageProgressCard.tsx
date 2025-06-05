import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../app/providers/theme-provider';

interface LanguageProgressCardProps {
  language: string;
  level: string;
  progress: number;
  streak: number;
}

export function LanguageProgressCard({ language, level, progress, streak }: LanguageProgressCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.language}>{language}</Text>
          <Text style={styles.level}>{level}</Text>
        </View>
        <View style={styles.streakContainer}>
          <MaterialCommunityIcons name="fire" size={20} color={Colors.light.rust} />
          <Text style={styles.streakText}>{streak} days</Text>
        </View>
      </View>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{progress}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  language: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  level: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.generalBG,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  streakText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.light.generalBG,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.rust,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.textSecondary,
    minWidth: 40,
  },
}); 