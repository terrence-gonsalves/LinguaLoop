import { Colors } from '@/providers/theme-provider';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface LanguageProgressCardProps {
  language: string;
  level: string;
  activities: Record<string, number>;
}

export function LanguageProgressCard({ language, level, activities }: LanguageProgressCardProps) {
  const [showAll, setShowAll] = useState(false);

  // convert seconds to hours and minutes
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // map activity names to MaterialCommunityIcons
  const iconMap: Record<string, string> = {
    Reading: 'book-outline',
    Writing: 'pencil-outline',
    Listening: 'headphones',
    Speaking: 'microphone-outline',
  };

  const activityList = Object.entries(activities).map(([type, seconds]) => ({
    type,
    time: formatTime(seconds),
    icon: iconMap[type] || 'star-outline', // default icon for unknown activities
  }));

  // only show up to 4 activities unless expanded
  const visibleActivities = showAll ? activityList : activityList.slice(0, 4);

  // split into rows of 2
  const rows: Array<typeof activityList> = [];
  for (let i = 0; i < visibleActivities.length; i += 2) {
    rows.push(visibleActivities.slice(i, i + 2));
  }

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
        {rows.map((row, rowIdx) => (
          <View
            key={rowIdx}
            style={[
              styles.activityRow,
              row.length === 1 ? styles.centeredRow : undefined,
            ]}
          >
            {row.map((activity) => (
              <View key={activity.type} style={styles.activityItemRow}>
                <MaterialCommunityIcons name={activity.icon as any} size={28} color={Colors.light.rust} style={styles.activityIcon} />
                <View style={styles.activityItem}>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                  <Text style={styles.activityLabel}>{activity.type}</Text>
                </View>
              </View>
            ))}
          </View>
        ))}
        {activityList.length > 4 && (
          <Text
            style={styles.showMore}
            onPress={() => setShowAll((prev) => !prev)}
          >
            {showAll ? 'Show less' : 'Show more'}
          </Text>
        )}
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
    flexDirection: 'column',
    gap: 8,
    justifyContent: 'space-between',
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  centeredRow: {
    justifyContent: 'center',
  },
  activityItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  activityIcon: {
    marginRight: 12,
  },
  activityItem: {
    alignItems: 'flex-start',
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
  showMore: {
    color: Colors.light.rust,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
    fontSize: 14,
  },
}); 