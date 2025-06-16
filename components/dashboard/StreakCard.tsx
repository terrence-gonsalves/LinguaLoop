import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../app/providers/theme-provider';

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  streakStartDate: string;
}

export function StreakCard({ currentStreak, longestStreak, streakStartDate }: StreakCardProps) {

  // format the date as "Month Day, Year"
  const formattedDate = new Date(streakStartDate).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={styles.container}>
      <View style={styles.streakContainer}>
        <View style={styles.streakItem}>
          <Text style={styles.streakLabel}>Current Streak</Text>
          <Text style={styles.streakValue}>{currentStreak} days</Text>
        </View>
        <View style={styles.streakItem}>
          <Text style={styles.streakLabel}>Longest Streak</Text>
          <Text style={styles.streakValue}>{longestStreak} days</Text>
        </View>
      </View>
      <View style={styles.startDateContainer}>
        <MaterialCommunityIcons name="calendar-start" size={16} color={Colors.light.textSecondary} />
        <Text style={styles.startDateText}>Started on {formattedDate}</Text>
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
  streakContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  streakItem: {
    alignItems: 'center',
  },
  streakLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  streakValue: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  startDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  startDateText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
}); 