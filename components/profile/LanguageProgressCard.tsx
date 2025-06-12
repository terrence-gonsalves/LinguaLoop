import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../app/providers/theme-provider';

interface LanguageProgressCardProps {
  language: string;
  level: string;
  activities: {
    reading: number;
    writing: number;
    speaking: number;
    listening: number;
  };
}

export function LanguageProgressCard({ language, level, activities }: LanguageProgressCardProps) {

  // convert seconds to hours and minutes
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const activityList = [
    { type: 'Reading', time: formatTime(activities.reading), icon: 'book' },
    { type: 'Writing', time: formatTime(activities.writing), icon: 'create' },
    { type: 'Speaking', time: formatTime(activities.speaking), icon: 'mic' },
    { type: 'Listening', time: formatTime(activities.listening), icon: 'headset' },
  ] as const;

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
      <View style={styles.activitiesContainer}>
        {activityList.map((activity) => (
          <View key={activity.type} style={styles.activityItem}>
            <MaterialIcons name={activity.icon} size={24} color={Colors.light.rust} />
            <Text style={styles.activityTime}>{activity.time}</Text>
            <Text style={styles.activityLabel}>{activity.type}</Text>
          </View>
        ))}
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
  activitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  activityItem: {
    alignItems: 'center',
    width: '45%',
    marginBottom: 8,
  },
  activityTime: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 8,
    marginBottom: 4,
  },
  activityLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
}); 