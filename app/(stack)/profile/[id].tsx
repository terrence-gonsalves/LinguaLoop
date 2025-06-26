import { Image as ExpoImage } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Stack } from 'expo-router/stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DefaultAvatar from '@/components/DefaultAvatar';
import { AchievementItem } from '@/components/profile/AchievementItem';
import { LanguageProgressCard } from '@/components/profile/LanguageProgressCard';
import { ProfileConnectionCard } from '@/components/profile/ProfileConnectionCard';
import { useAchievements } from '@/hooks/useAchievements';
import { useActiveConnections } from '@/hooks/useActiveConnections';
import { useLanguageSummary } from '@/hooks/useLanguageSummary';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { showErrorToast, showSuccessToast } from '@/lib/toast';
import { Colors } from '@/providers/theme-provider';

interface UserProfile {
  id: string;
  name: string | null;
  user_name: string | null;
  about_me: string | null;
  avatar_url: string | null;
  native_language: string | null;
  onboarding_completed: boolean;
}

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile: currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [nativeLanguageName, setNativeLanguageName] = useState<string>('');

  console.log('DEBUG: UserProfileScreen - Connection ID ', id);

  // hooks for user data
  const { languages, isLoading: isLoadingLanguages, error: languagesError } = useLanguageSummary(id || '');
  const { connections, totalCount: connectionsCount, isLoading: isLoadingConnections, error: connectionsError, refresh: refreshConnections } = useActiveConnections(id || '');
  const { achievements, totalCount: achievementsCount, isLoading: isLoadingAchievements, error: achievementsError } = useAchievements(id || '');

  // debug log for troubleshooting
  React.useEffect(() => {
    if (!isLoadingLanguages) {
      console.log('DEBUG: languages from useLanguageSummary:', languages);
    }
  }, [languages, isLoadingLanguages]);

  useEffect(() => {
    if (id) {
      loadUserProfile();
      checkFollowStatus();
    }
  }, [id]);

  async function loadUserProfile() {
    try {
      setIsLoading(true);

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setUserProfile(profile);

      // load native language name
      if (profile.native_language) {
        const { data: languageData } = await supabase
          .from('master_languages')
          .select('name')
          .eq('id', profile.native_language)
          .single();

        if (languageData) {
          setNativeLanguageName(languageData.name);
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      showErrorToast('Failed to load user profile');
    } finally {
      setIsLoading(false);
    }
  }

  async function checkFollowStatus() {
    if (!currentUser?.id || !id) return;

    try {
      const { data, error } = await supabase
        .from('follows')
        .select('*')
        .match({ follower_id: currentUser.id, following_id: id })
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }

      setIsFollowing(!!data);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  }

  async function toggleFollow() {
    if (!currentUser?.id || !id) return;

    try {
      if (isFollowing) {

        // unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .match({ follower_id: currentUser.id, following_id: id });

        if (error) throw error;
        setIsFollowing(false);
        showSuccessToast('Unfollowed user');
      } else {

        // follow
        const { error } = await supabase
          .from('follows')
          .insert({ follower_id: currentUser.id, following_id: id });

        if (error) throw error;
        setIsFollowing(true);
        showSuccessToast('Followed user');
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      showErrorToast('Failed to update follow status');
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

    // filter out native language
    const targetLanguages = userProfile && userProfile.native_language
      ? languages.filter((lang: any) => lang.master_language_id !== userProfile.native_language)
      : languages;

    if (targetLanguages.length === 0) {
      return <Text style={styles.noDataText}>No languages added yet</Text>;
    }

    // only show up to 2 languages
    return targetLanguages.slice(0, 2).map((lang: any) => (
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
      <ProfileConnectionCard
        key={connection.id}
        name={connection.name || ''}
        username={connection.user_name || ''}
        nativeLanguage={connection.native_language || 'Unknown'}
        avatarUrl={connection.avatar_url || undefined}
        languages={[]}
        streak={connection.streak}
        connectionId={connection.id}
        onUnfollow={refreshConnections}
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
        ? new Date(dateToShow).toLocaleDateString(undefined, { 
          timeZone: userTimeZone, 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' })
        : '';
      return (
        <AchievementItem
          key={achievement.id}
          title={achievement.title}
          notes={achievement.notes || ''}
          icon="star-outline"
          progress={0}
          isCompleted={false}
          date={localizedDate}
        />
      );
    });
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Connection' }} />
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.rust} />
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (!userProfile) {
    return (
      <>
        <Stack.Screen options={{ title: 'Connection' }} />
        <SafeAreaView style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>User not found</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Connection' }} />
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.profileSection}>
            {userProfile.avatar_url ? (
              <ExpoImage
                source={{ uri: userProfile.avatar_url }}
                style={styles.avatar}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <DefaultAvatar size={100} letter={userProfile.name?.[0] || userProfile.user_name?.[0] || '?'} />
            )}
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userProfile.name || 'User'}</Text>
              <Text style={styles.username}>@{userProfile.user_name || 'username'}</Text>
              <Text style={styles.nativeLanguage}>Native: {nativeLanguageName}</Text>
              <Text style={styles.bio}>
                {userProfile.about_me || ''}
              </Text>
              <Pressable 
                style={[styles.actionButton, isFollowing && styles.unfollowButton]}
                onPress={toggleFollow}
              >
                <Text style={[styles.actionButtonText, isFollowing && styles.unfollowButtonText]}>
                  {isFollowing ? 'Unfollow' : 'Follow'}
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
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
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
  unfollowButton: {
    backgroundColor: Colors.light.buttonPrimary,
  },
  unfollowButtonText: {
    color: Colors.light.background,
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
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 