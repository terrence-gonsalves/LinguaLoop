import { useAchievements } from '@/hooks/useAchievements';
import { useActiveConnections } from '@/hooks/useActiveConnections';
import { useLanguageSummary } from '@/hooks/useLanguageSummary';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../app/providers/theme-provider';
import DefaultAvatar from '../../components/DefaultAvatar';
import { AchievementItem } from '../../components/profile/AchievementItem';
import AddAchievementModal from '../../components/profile/AddAchievementModal';
import AddConnectionModal from '../../components/profile/AddConnectionModal';
import { ConnectionCard } from '../../components/profile/ConnectionCard';
import { LanguageProgressCard } from '../../components/profile/LanguageProgressCard';

const ACHIEVEMENT_TYPE_ICONS: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  award: 'trophy-outline',
  certificate: 'certificate-outline',
  course: 'book-open-outline',
  badge: 'shield-star-outline',
  other: 'star-outline',
};

export default function ProfileScreen() {
  const { profile } = useAuth();
  const isOwnProfile = true; // TODO: add logic to determine if viewing own profile
  const [nativeLanguageName, setNativeLanguageName] = useState<string>('');
  const { languages, isLoading: isLoadingLanguages, error: languagesError } = useLanguageSummary(profile?.id || '');
  const { connections, totalCount: connectionsCount, isLoading: isLoadingConnections, error: connectionsError, refresh: refreshConnections } = useActiveConnections(profile?.id || '');
  const { achievements, totalCount: achievementsCount, isLoading: isLoadingAchievements, error: achievementsError, refresh: refreshAchievements } = useAchievements(profile?.id || '');
  const [showAddConnection, setShowAddConnection] = useState(false);
  const [showAddAchievement, setShowAddAchievement] = useState(false);

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

  const renderLanguageCards = () => {
    if (isLoadingLanguages) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.rust} />
        </View>
      );
    }

    if (languagesError) {
      return <Text style={styles.errorText}>Error loading languages: {languagesError}</Text>;
    }

    if (languages.length === 0) {
      return <Text style={styles.noDataText}>No languages added yet</Text>;
    }

    // only show up to 2 languages
    return languages.slice(0, 2).map((lang: any) => (
      <LanguageProgressCard
        key={lang.id}
        language={lang.name}
        level={lang.level}
        activities={lang.activities}
      />
    ));
  };

  const renderConnections = () => {
    if (isLoadingConnections) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.rust} />
        </View>
      );
    }

    if (connectionsError) {
      return <Text style={styles.errorText}>Error loading connections: {connectionsError}</Text>;
    }

    if (connections.length === 0) {
      return <Text style={styles.noDataText}>No active connections yet</Text>;
    }

    return connections.map((connection) => (
      <ConnectionCard
        key={connection.id}
        name={connection.name || ''}
        username={connection.user_name || ''}
        nativeLanguage={connection.native_language || 'Unknown'}
        avatarUrl={connection.avatar_url || undefined}
        languages={[]}
        streak={0}
      />
    ));
  };

  const renderAchievements = () => {
    if (isLoadingAchievements) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.rust} />
        </View>
      );
    }

    if (achievementsError) {
      return <Text style={styles.errorText}>Error loading achievements: {achievementsError}</Text>;
    }

    if (achievements.length === 0) {
      return <Text style={styles.noDataText}>No achievements yet</Text>;
    }

    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return achievements.map((achievement: any) => {
      const dateToShow = achievement.obtained_date || achievement.created_at;
      const localizedDate = dateToShow
        ? new Date(dateToShow).toLocaleDateString(undefined, { timeZone: userTimeZone, year: 'numeric', month: 'long', day: 'numeric' })
        : '';
      return (
        <AchievementItem
          key={achievement.id}
          title={achievement.title}
          notes={achievement.notes || ''}
          icon={ACHIEVEMENT_TYPE_ICONS[achievement.type] || 'star-outline'}
          progress={0}
          isCompleted={false}
          date={localizedDate}
        />
      );
    });
  };

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
            {languages.length > 2 && (
              <Pressable style={styles.viewAllLink} onPress={() => router.push('/(stack)/languages')}>
                <Text style={styles.viewAllText}>View All</Text>
              </Pressable>
            )}
          </View>
          <View style={styles.languageCards}>
            {renderLanguageCards()}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Connections</Text>
            {connectionsCount > 2 && (
              <Pressable style={styles.viewAllLink} onPress={() => router.push('/(stack)/connections')}>
                <Text style={styles.viewAllText}>View All</Text>
              </Pressable>
            )}
          </View>
          <View style={styles.connectionCards}>
            {renderConnections()}
          </View>
          <Pressable style={styles.addConnectionButton} onPress={() => setShowAddConnection(true)}>
              <Text style={styles.addConnectionButtonText}>Add Connection</Text>
            </Pressable>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            {achievementsCount > 2 && (
              <Pressable style={styles.viewAllLink} onPress={() => router.push('/(stack)/achievements')}>
                <Text style={styles.viewAllText}>History</Text>
              </Pressable>
            )}
          </View>
          <View style={styles.achievements}>
            {renderAchievements()}
          </View>
          <Pressable style={styles.addAchievementButton} onPress={() => setShowAddAchievement(true)}>
            <Text style={styles.addAchievementButtonText}>Add Achievement</Text>
          </Pressable>
        </View>
      </ScrollView>
      <AddConnectionModal visible={showAddConnection} onClose={() => { setShowAddConnection(false); refreshConnections(); }} />
      <AddAchievementModal visible={showAddAchievement} onClose={() => { setShowAddAchievement(false); refreshAchievements(); }} onAdded={() => { setShowAddAchievement(false); refreshAchievements(); }} saveLabel="Save" />
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
    borderRadius: 5,
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
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: Colors.light.error,
    textAlign: 'center',
    padding: 16,
  },
  noDataText: {
    color: Colors.light.textSecondary,
    textAlign: 'center',
    padding: 16,
  },
  addConnectionButton: {
    backgroundColor: Colors.light.buttonPrimary,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignSelf: 'center',
    marginVertical: 8,
  },
  addConnectionButtonText: {
    color: Colors.light.background,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  addAchievementButton: {
    backgroundColor: Colors.light.buttonPrimary,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignSelf: 'center',
    marginLeft: 8,
    marginTop: 10
  },
  addAchievementButtonText: {
    color: Colors.light.background,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
}); 