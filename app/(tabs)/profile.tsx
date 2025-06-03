import { Colors } from '@/constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DefaultAvatar from '../../components/DefaultAvatar';
import { AchievementItem } from '../../components/profile/AchievementItem';
import { ConnectionCard } from '../../components/profile/ConnectionCard';
import { LanguageProgressCard } from '../../components/profile/LanguageProgressCard';

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <Pressable style={styles.notificationButton}>
            <MaterialIcons name="notifications" size={24} color={Colors.light.textPrimary} />
          </Pressable>
        </View>

        <View style={styles.profileSection}>
          <DefaultAvatar size={100} />
          <Text style={styles.profileName}>Alice Smith</Text>
          <Text style={styles.username}>@alice.sm</Text>
          <Text style={styles.bio}>
            Passionate language learner on a journey to explore diverse cultures through communication. Currently diving deep into Spanish and Japanese!
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Language Summary</Text>
            <Link href="../languages" asChild>
              <Pressable style={styles.viewAllLink}>
                <Text style={styles.viewAllText}>View All</Text>
              </Pressable>
            </Link>
          </View>
          <View style={styles.languageCards}>
            <LanguageProgressCard
              language="Spanish"
              level="Intermediate"
              progress={75}
              words={2345}
              lessons={15}
            />
            <LanguageProgressCard
              language="Japanese"
              level="Beginner"
              progress={40}
              words={860}
              lessons={12}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Connections</Text>
            <Link href="../connections" asChild>
              <Pressable style={styles.viewAllLink}>
                <Text style={styles.viewAllText}>View All</Text>
              </Pressable>
            </Link>
          </View>
          <View style={styles.connectionCards}>
            <ConnectionCard
              name="Sarah Johnson"
              username="@sarah.j"
              nativeLanguage="French"
              interests={['English', 'Travel', 'Culture']}
              onMessage={() => {}}
            />
            <ConnectionCard
              name="David Lee"
              username="@david.lingua"
              nativeLanguage="Mandarin"
              interests={['Spanish', 'Tech', 'Music']}
              onMessage={() => {}}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Learning Journey</Text>
            <Link href="../achievements" asChild>
              <Pressable style={styles.viewAllLink}>
                <Text style={styles.viewAllText}>History</Text>
              </Pressable>
            </Link>
          </View>
          <View style={styles.achievements}>
            <AchievementItem
              date="October 2023"
              title="Achieved A1 Spanish Proficiency"
              description="Successfully completed all A1 level lessons and passed the speaking assessment."
              onReview={() => {}}
            />
            <AchievementItem
              date="September 2023"
              title="Mastered Japanese Hiragana"
              description="Learned and memorized all Hiragana characters and pronunciations."
              onReview={() => {}}
            />
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: 24,
  },
  notificationButton: {
    padding: 8,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginBottom: 12,
  },
  bio: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  viewAllLink: {
    padding: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.light.rust,
    fontWeight: '500',
  },
  languageCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  connectionCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  achievements: {
    marginTop: 8,
  },
}); 