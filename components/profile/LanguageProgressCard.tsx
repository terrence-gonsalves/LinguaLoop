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
          <View style={styles.levelContainer}>
            <Text style={styles.level}>{level}</Text>
          </View>
        </View>
      </View>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{progress}%</Text>
          <Text style={styles.statLabel}>Complete</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>2,345</Text>
          <Text style={styles.statLabel}>Words</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>72</Text>
          <Text style={styles.statLabel}>Lessons</Text>
        </View>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  language: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  levelContainer: {
    backgroundColor: Colors.light.generalBG,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  level: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.light.border,
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