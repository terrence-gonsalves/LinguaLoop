import Colors from '@/constants/Colors';
import { useDailyQuote } from '@/hooks/useDailyQuote';
import { useWeeklyStreak } from '@/hooks/useWeeklyStreak';
import { useAuth } from '@/lib/auth-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DefaultAvatar from '../../components/DefaultAvatar';

interface ActivityCardProps {
  title: string;
  icon: React.ReactNode;
}

const ActivityCard = ({ title, icon }: ActivityCardProps) => (
  <View style={styles.activityCard}>
    {icon}
    <Text style={styles.activityTitle}>{title}</Text>
    <Text style={styles.activitySubtext}>Log your session</Text>
  </View>
);

export default function DashboardScreen() {
  const { quote, isLoading } = useDailyQuote();
  const { profile } = useAuth();
  const { week, isLoading: isStreakLoading } = useWeeklyStreak(profile?.id);

  // format current date as 'April 11, 2025'
  const today = new Date();
  const formattedDate = today.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const weekDayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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

        {/* Study Time Card */}
        <View style={styles.studyTimeCard}>
          <Text style={styles.studyTimeLabel}>Total Study Time</Text>
          <View style={styles.timeContainer}>
            <Text style={styles.timeNumber}>125</Text>
            <Text style={styles.timeUnit}>h </Text>
            <Text style={styles.timeNumber}>30</Text>
            <Text style={styles.timeUnit}>m</Text>
          </View>
          <Text style={styles.timeSubtext}>across 3 languages</Text>
        </View>

        {/* Activity Cards Grid */}
        <View style={styles.activityGrid}>
          <ActivityCard 
            title="Reading" 
            icon={<Ionicons name="book-outline" size={24} color={Colors.light.rust} />}
          />
          <ActivityCard 
            title="Writing" 
            icon={<MaterialCommunityIcons name="pencil-outline" size={24} color={Colors.light.rust} />}
          />
          <ActivityCard 
            title="Listening" 
            icon={<MaterialCommunityIcons name="headphones" size={24} color={Colors.light.rust} />}
          />
          <ActivityCard 
            title="Speaking" 
            icon={<MaterialCommunityIcons name="microphone-outline" size={24} color={Colors.light.rust} />}
          />
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

        {/* Quick Tips */}
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
    backgroundColor: Colors.light.rust,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  studyTimeLabel: {
    color: Colors.light.text,
    fontSize: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 8,
  },
  timeNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  timeUnit: {
    fontSize: 24,
    color: Colors.light.text,
    opacity: 0.8,
  },
  timeSubtext: {
    color: Colors.light.text,
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontSize: 15,
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
    fontSize: 15,
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
});
