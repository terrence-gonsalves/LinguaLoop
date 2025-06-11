import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { MaterialIcons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../app/providers/theme-provider';
import DefaultAvatar from '../../components/DefaultAvatar';
import { AchievementItem } from '../../components/profile/AchievementItem';
import { ConnectionCard } from '../../components/profile/ConnectionCard';
import { LanguageProgressCard } from '../../components/profile/LanguageProgressCard';

export default function ProfileScreen() {
  const { profile } = useAuth();
  const isOwnProfile = true; // TODO: Add logic to determine if viewing own profile
  const [nativeLanguageName, setNativeLanguageName] = useState<string>('');

  useEffect(() => {
    if (profile?.native_language) {
      loadNativeLanguage();
    }
  }, [profile?.native_language]);

  async function loadNativeLanguage() {
    try {
      const { data, error } = await supabase
        .from('master_languages')
        .select('name')
        .eq('id', profile?.native_language)
        .single();

      if (error) throw error;
      if (data) {
        setNativeLanguageName(data.name);
      }
    } catch (error) {
      console.error('Error loading native language:', error);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <Pressable 
            style={styles.notificationButton}
            onPress={() => router.push('/(stack)/notifications')}
          >
            <MaterialIcons name="notifications" size={24} color={Colors.light.textPrimary} />
          </Pressable>
        </View>

        <View style={styles.profileSection}>
          {profile?.avatar_url ? (
            <ExpoImage
              source={{ uri: profile.avatar_url }}
              style={styles.avatar}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <DefaultAvatar size={100} letter={profile?.name?.[0] || profile?.user_name?.[0] || '?'} />
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile?.name || 'User'}</Text>
            <Text style={styles.username}>@{profile?.user_name || 'username'}</Text>
            <Text style={styles.nativeLanguage}>Native: {nativeLanguageName}</Text>
            <Text style={styles.bio}>
              {profile?.about_me || ''}
            </Text>
            <Pressable 
              style={styles.actionButton}
              onPress={() => {
                if (isOwnProfile) {
                  router.push('/(stack)/edit-profile');
                } else {
                  // TODO: Implement follow functionality
                  console.log('Follow user');
                }
              }}
            >
              <Text style={styles.actionButtonText}>
                {isOwnProfile ? 'Edit Profile' : 'Follow'}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Language Summary</Text>
            <Pressable style={styles.viewAllLink} onPress={() => router.push('/(stack)/languages')}>
              <Text style={styles.viewAllText}>View All</Text>
            </Pressable>
          </View>
          <View style={styles.languageCards}>
            <LanguageProgressCard
              language="Spanish"
              level="Intermediate"
              progress={75}
              streak={15}
            />
            <LanguageProgressCard
              language="Japanese"
              level="Beginner"
              progress={40}
              streak={8}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Connections</Text>
            <Pressable style={styles.viewAllLink} onPress={() => router.push('/(stack)/connections')}>
              <Text style={styles.viewAllText}>View All</Text>
            </Pressable>
          </View>
          <View style={styles.connectionCards}>
            <ConnectionCard
              name="Sarah Johnson"
              languages={['French']}
              streak={12}
            />
            <ConnectionCard
              name="David Lee"
              languages={['Mandarin']}
              streak={23}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <Pressable style={styles.viewAllLink} onPress={() => router.push('/(stack)/achievements')}>
              <Text style={styles.viewAllText}>History</Text>
            </Pressable>
          </View>
          <View style={styles.achievements}>
            <AchievementItem
              title="Achieved A1 Spanish Proficiency"
              description="Successfully completed all A1 level lessons and passed the speaking assessment."
              icon="trophy"
              progress={100}
              isCompleted={true}
            />
            <AchievementItem
              title="Mastered Japanese Hiragana"
              description="Learned and memorized all Hiragana characters and pronunciations."
              icon="book-education"
              progress={100}
              isCompleted={true}
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
  },
  notificationButton: {
    padding: 8,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.background,
    marginBottom: 16,
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: 16,
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
    marginBottom: 8,
  },
  nativeLanguage: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 12,
  },
  bio: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: Colors.light.buttonPrimary,
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  actionButtonText: {
    color: Colors.light.background,
    fontSize: 16,
    fontWeight: '600',
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
    gap: 12,
  },
  connectionCards: {
    gap: 12,
  },
  achievements: {
    gap: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
}); 