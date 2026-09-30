import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import DefaultAvatar from '@/components/DefaultAvatar';

import { useAuth } from '@/lib/auth-context';

import { Colors } from '@/providers/theme-provider';

interface ProfileConnectionCardProps {
  userId: string;
  name: string;
  languages: string[];
  streak: number;
  avatarUrl?: string;
  nativeLanguage?: string;
  username?: string;
  connectionId: string;
  onUnfollow?: () => void;
}

export function ProfileConnectionCard({
  userId,
  name,
  languages,
  streak,
  avatarUrl,
  nativeLanguage = 'French',
  username = '@sarah.j',
  connectionId,
  onUnfollow,
}: ProfileConnectionCardProps) {
  const { profile } = useAuth();

  const handleProfilePress = () => {
    router.push(`/(stack)/profile/${userId}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        <Pressable
          style={({ pressed }) => [styles.leftContent, pressed && { opacity: 0.7 }]}
          onPress={handleProfilePress}
        >
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <DefaultAvatar size={48} letter={name[0]} />
          )}
          <View style={styles.info}>
            <Text style={styles.name}>{name}</Text>
            {username && <Text style={styles.username}>@{username}</Text>}
            <Text style={styles.nativeLanguage}>Native: {nativeLanguage}</Text>
            <View style={styles.languagesContainer}>
              {languages.map((language, index) => (
                <View key={language} style={styles.languageTag}>
                  <Text style={styles.languageText}>{language}</Text>
                </View>
              ))}
            </View>
          </View>
        </Pressable>

        {/* streak indicator */}
        <View style={styles.streakContainer}>
          <MaterialCommunityIcons name="fire" size={16} color={Colors.light.rust} />
          <Text style={styles.streakText}>{streak} days</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    padding: 12,
    borderRadius: 12,
  },
  mainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  info: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  nativeLanguage: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  languagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  languageTag: {
    backgroundColor: Colors.light.generalBG,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  languageText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.generalBG,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.light.rust,
  },
  unfollowButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: Colors.light.generalBG,
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 8,
  },
});
