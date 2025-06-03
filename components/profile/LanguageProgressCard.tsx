import Colors from '@/constants/Colors';
import { StyleSheet, Text, View } from 'react-native';

interface LanguageProgressCardProps {
  language: string;
  level: string;
  progress: number;
  words: number;
  lessons: number;
}

export function LanguageProgressCard({ language, level, progress, words, lessons }: LanguageProgressCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.languageInfo}>
          <Text style={styles.flag}>
            {language === 'Spanish' ? '🇪🇸' : '🇯🇵'}
          </Text>
          <Text style={styles.language}>{language}</Text>
        </View>
        <View style={styles.levelContainer}>
          <Text style={styles.level}>{level}</Text>
        </View>
      </View>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.progressText}>{progress}% Complete</Text>
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{words}</Text>
          <Text style={styles.statLabel}>Words</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{lessons}</Text>
          <Text style={styles.statLabel}>Lessons</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flag: {
    fontSize: 16,
  },
  language: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  levelContainer: {
    backgroundColor: Colors.light.ice,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  level: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  progressContainer: {
    height: 4,
    backgroundColor: Colors.light.ice,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.light.rust,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 12,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
}); 