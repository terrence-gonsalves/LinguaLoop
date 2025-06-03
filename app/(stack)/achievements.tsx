import Colors from '@/constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AchievementItem } from '../../components/profile/AchievementItem';

const achievements = [
  {
    date: 'October 2023',
    title: 'Achieved A1 Spanish Proficiency',
    description: 'Successfully completed all A1 level lessons and passed the speaking assessment.',
  },
  {
    date: 'September 2023',
    title: 'Mastered Japanese Hiragana',
    description: 'Learned and memorized all Hiragana characters and pronunciations.',
  },
  {
    date: 'August 2023',
    title: 'First Spanish Conversation',
    description: 'Had a 15-minute conversation with a native Spanish speaker without using English.',
  },
  {
    date: 'July 2023',
    title: 'Completed 100 Lessons',
    description: 'Reached the milestone of completing 100 language learning lessons.',
  },
  {
    date: 'June 2023',
    title: 'Perfect Week Streak',
    description: 'Maintained a perfect study streak for 7 consecutive days.',
  },
  {
    date: 'May 2023',
    title: 'Vocabulary Master',
    description: 'Learned and retained 500 new Spanish words.',
  },
];

export default function AchievementsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.light.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Learning Journey</Text>
        <Pressable style={styles.filterButton}>
          <MaterialIcons name="filter-list" size={24} color={Colors.light.textPrimary} />
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>15</Text>
            <Text style={styles.statLabel}>Achievements</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Languages</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>180</Text>
            <Text style={styles.statLabel}>Days</Text>
          </View>
        </View>

        <View style={styles.timeline}>
          {achievements.map((achievement, index) => (
            <AchievementItem
              key={index}
              {...achievement}
              onReview={() => {}}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.generalBG,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  backButton: {
    padding: 8,
  },
  filterButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.background,
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCard: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.light.rust,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  timeline: {
    paddingHorizontal: 16,
  },
}); 