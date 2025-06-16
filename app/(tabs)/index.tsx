import Colors from '@/constants/Colors';
import { useActivities } from '@/hooks/useActivities';
import { useDailyQuote } from '@/hooks/useDailyQuote';
import { useStudyStats } from '@/hooks/useStudyStats';
import { useWeeklyStreak } from '@/hooks/useWeeklyStreak';
import { useAuth } from '@/lib/auth-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import DefaultAvatar from '../../components/DefaultAvatar';

// map activity names to their respective icons
const ACTIVITY_ICONS: Record<string, { icon: keyof typeof MaterialCommunityIcons.glyphMap, type: 'material' | 'ionicon' }> = {
  'Reading': { icon: 'book-outline', type: 'ionicon' },
  'Writing': { icon: 'pencil-outline', type: 'material' },
  'Listening': { icon: 'headphones', type: 'material' },
  'Speaking': { icon: 'microphone-outline', type: 'material' },
};

interface ActivityCardProps {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
}

const ActivityCard = ({ title, icon, onPress }: ActivityCardProps) => (
  <Pressable 
    style={({ pressed }) => [
      styles.activityCard,
      pressed && styles.activityCardPressed
    ]}
    onPress={onPress}
  >
    {icon}
    <Text style={styles.activityTitle}>{title}</Text>
    <Text style={styles.activitySubtext}>Log your session</Text>
  </Pressable>
);

export default function DashboardScreen() {
  const { quote, isLoading } = useDailyQuote();
  const { profile } = useAuth();
  const { week, isLoading: isStreakLoading } = useWeeklyStreak(profile?.id);
  const { stats, isLoading: isStatsLoading } = useStudyStats(profile?.id);
  const { activities, isLoading: isActivitiesLoading } = useActivities();

  // format current date as 'April 11, 2025'
  const today = new Date();
  const formattedDate = today.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const weekDayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const renderGoalProgress = (progress: number) => {
    const size = 40;
    const strokeWidth = 4;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <View style={styles.goalProgressContainer}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={Colors.light.text}
            strokeWidth={strokeWidth}
            fill="none"
            opacity={0.2}
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={Colors.light.text}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <Text style={styles.goalProgressText}>{progress}%</Text>
      </View>
    );
  };

  const renderActivityIcon = (activityName: string) => {
    const iconConfig = ACTIVITY_ICONS[activityName];
    if (!iconConfig) return null;

    if (iconConfig.type === 'ionicon') {
      return <Ionicons name={iconConfig.icon as any} size={24} color={Colors.light.rust} />;
    }
    return <MaterialCommunityIcons name={iconConfig.icon} size={24} color={Colors.light.rust} />;
  };

  const handleActivityPress = (activityName: string) => {
    router.push(`/(tabs)/track?activity=${activityName.toLowerCase()}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileInfo}>
            <View>
              <Text style={styles.welcomeText}>Welcome</Text>
              {profile?.name && <Text style={styles.userName}>{profile.name}</Text>}
            </View>
            <View style={styles.profileImageContainer}>
              {profile?.avatar_url ? (
                <ExpoImage
                  source={{ uri: profile.avatar_url }}
                  style={styles.profileImage}
                  contentFit="cover"
                />
              ) : (
                <DefaultAvatar size={60} letter={profile?.name?.[0] || 'U'} />
              )}
            </View>
          </View>
        </View>

        {/* Daily Streak Section */}
        <View style={styles.streakSection}>
          <Text style={styles.streakDate}>{formattedDate}</Text>
          <View style={styles.streakRow}>
            {week.map((day, idx) => {
              const isToday = day.date.toDateString() === today.toDateString();
              return (
                <View key={idx} style={[styles.streakDay, isToday && styles.streakDayToday]}>
                  <Text style={[styles.streakDayLabel, isToday && styles.streakDayLabelToday]}>
                    {weekDayLabels[idx]}
                  </Text>
                  <Text style={[styles.streakDayNum, isToday && styles.streakDayNumToday]}>
                    {day.date.getDate().toString().padStart(2, '0')}
                  </Text>
                  {day.tracked ? (
                    isToday ? (
                      <View style={styles.streakTodayFireCircle}>
                        <MaterialCommunityIcons name="fire" size={24} color={Colors.light.rust} />
                      </View>
                    ) : (
                      <MaterialCommunityIcons name="fire" size={24} color={Colors.light.rust} />
                    )
                  ) : (
                    <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={24} color={Colors.light.textTertiary} />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Goal and Study Time Section */}
        <View style={styles.statsRow}>
          {/* Goal Section */}
          <View style={styles.goalCard}>
            {isStatsLoading ? (
              <ActivityIndicator size="small" color={Colors.light.textPrimary} />
            ) : (
              <>
                <Text style={styles.studyGoalLabel}>Study Goal</Text>
                {stats.goal ? (
                  <>
                    <View style={styles.goalHeader}>
                      <Text style={styles.goalTitle}>{stats.goal.title}</Text>
                      {renderGoalProgress(stats.goal.progress)}
                    </View>
                    {stats.goal.description && (
                      <Text style={styles.goalDescription}>{stats.goal.description}</Text>
                    )}
                  </>
                ) : (
                  <Pressable
                    onPress={() => router.push('/(stack)/goals')}
                    style={styles.createGoalButton}
                  >
                    <Text style={styles.createGoalText}>Create a goal</Text>
                  </Pressable>
                )}
              </>
            )}
          </View>

          {/* Study Time Card */}
          <View style={styles.studyTimeCard}>
            {isStatsLoading ? (
              <ActivityIndicator size="small" color={Colors.light.textLight} />
            ) : (
              <>
                <Text style={styles.studyTimeLabel}>Total Study Time</Text>
                <View style={styles.timeContainer}>
                  <Text style={styles.timeNumber}>{stats.totalStudyTime.hours}</Text>
                  <Text style={styles.timeUnit}>h </Text>
                  <Text style={styles.timeNumber}>{stats.totalStudyTime.minutes}</Text>
                  <Text style={styles.timeUnit}>m</Text>
                </View>
                <Text style={styles.timeSubtext}>across {stats.languageCount} languages</Text>
              </>
            )}
          </View>
        </View>

        {/* Activity Cards Grid */}
        <View style={styles.activityGrid}>
          {isActivitiesLoading ? (
            <ActivityIndicator size="small" color={Colors.light.rust} />
          ) : (
            activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                title={activity.name}
                icon={renderActivityIcon(activity.name)}
                onPress={() => handleActivityPress(activity.name)}
              />
            ))
          )}
        </View>

        {/* Daily Inspiration */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Daily Inspiration</Text>
          </View>
          <View style={styles.quoteCard}>
            {isLoading ? (
              <ActivityIndicator size="small" color={Colors.light.rust} />
            ) : (
              <>
                <Text style={styles.quoteText}>"{quote.quote}"</Text>
                <Text style={styles.quoteAuthor}>- {quote.author}</Text>
              </>
            )}
          </View>
        </View>

        {/* Quick Tips }
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Quick Tips</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipText}>
              • Try immersive listening with podcasts to improve comprehension.
            </Text>
            <Text style={styles.tipText}>
              • Practice writing daily journal entries in your target language.
            </Text>
          </View>
        </View>
        {*/}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.generalBG,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  profileSection: {
    paddingVertical: 20,
  },
  profileInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: Colors.light.textPrimary,
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginTop: 4,
  },
  profileImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 50,
    backgroundColor: Colors.light.background,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  studyTimeCard: {
    flex: 1,
    backgroundColor: Colors.light.rust,
    borderRadius: 16,
    padding: 20,
  },
  studyGoalLabel: {
    color: Colors.light.textLight,
    fontSize: 20,
    fontWeight: 'bold',
  },
  studyTimeLabel: {
    color: Colors.light.textLight,
    fontSize: 20,
    fontWeight: 'bold',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 8,
  },
  timeNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.light.textLight,
  },
  timeUnit: {
    fontSize: 24,
    color: Colors.light.textLight,
    opacity: 0.8,
  },
  timeSubtext: {
    color: Colors.light.textLight,
    opacity: 0.8,
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  activityCard: {
    backgroundColor: Colors.light.background,
    width: '48%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityCardPressed: {
    backgroundColor: Colors.light.background,
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginTop: 8,
  },
  activitySubtext: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  section: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  quoteCard: {
    padding: 15,
    borderRadius: 16,
    backgroundColor: Colors.light.background,
  },
  quoteText: {
    fontSize: 16,
    color: Colors.light.textPrimary,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  quoteAuthor: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 8,
    textAlign: 'right',
  },
  journeySection: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  journeyStats: {
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  statLabel: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.rust,
  },
  tipsSection: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  tipsList: {
    gap: 12,
  },
  tipText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  streakSection: {
    backgroundColor: Colors.light.callOutBG,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  streakDate: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.textTertiary,
    marginBottom: 12,
  },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakDay: {
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 36,
    padding: 2,
  },
  streakDayLabel: {
    fontSize: 13,
    color: Colors.light.textTertiary,
    fontWeight: '500',
  },
  streakDayNum: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textTertiary,
    marginTop: 2,
    marginBottom: 2,
  },
  streakDayToday: {
    backgroundColor: Colors.light.rust,
    borderRadius: 15,
    padding: 4,
  },
  streakDayLabelToday: {
    fontSize: 13,
    color: Colors.light.textTertiary,
    fontWeight: '700',
  },
  streakDayNumToday: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.textTertiary,
    marginTop: 2,
    marginBottom: 2,
  },
  streakTodayFireCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  goalCard: {
    flex: 1,
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    flex: 1,
    marginRight: 12,
  },
  goalDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  goalProgressContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalProgressText: {
    position: 'absolute',
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  createGoalButton: {
    paddingVertical: 8,
  },
  createGoalText: {
    fontSize: 16,
    color: Colors.light.buttonPrimary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
});
