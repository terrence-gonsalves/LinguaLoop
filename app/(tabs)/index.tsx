import Colors from '@/constants/Colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
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
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileInfo}>
            <View>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>Sarah</Text>
            </View>
            <View style={styles.profileImageContainer}>
              <DefaultAvatar size={50} />
            </View>
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
        <View style={styles.inspirationCard}>
          <View style={styles.inspirationHeader}>
            <MaterialCommunityIcons name="format-quote-open" size={24} color={Colors.light.rust} />
            <Text style={styles.inspirationTitle}>Daily Inspiration</Text>
          </View>
          <Text style={styles.quoteText}>
            "The beautiful thing about learning is that no one can take it away from you."
          </Text>
          <Text style={styles.quoteAuthor}>- B.B. King</Text>
        </View>

        {/* Learning Journey */}
        <View style={styles.journeySection}>
          <Text style={styles.sectionTitle}>Your Learning Journey</Text>
          <View style={styles.journeyStats}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Current Streak</Text>
              <Text style={styles.statValue}>14 Days</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Words Mastered</Text>
              <Text style={styles.statValue}>523</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Next Goal</Text>
              <Text style={styles.statValue}>B2 Fluency</Text>
            </View>
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
    color: Colors.light.textSecondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginTop: 4,
  },
  profileImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
  inspirationCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  inspirationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inspirationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.rust,
    marginLeft: 8,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: 16,
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
});
