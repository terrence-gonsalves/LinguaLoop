import DefaultAvatar from '@/components/DefaultAvatar';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/providers/theme-provider';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

interface ProfileConnectionCardProps {
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
  name, 
  languages, 
  streak, 
  avatarUrl,
  nativeLanguage = 'French',
  username = '@sarah.j',
  connectionId,
  onUnfollow
}: ProfileConnectionCardProps) {
  const { profile } = useAuth();

  const handleUnfollow = () => {
    Alert.alert(
      'Unfollow User',
      `Are you sure you want to unfollow ${name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Unfollow',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('follows')
                .delete()
                .match({ 
                  follower_id: profile?.id, 
                  following_id: connectionId 
                });

              if (error) throw error;
              
              // call the callback to refresh the connections list
              onUnfollow?.();
            } catch (error) {
              console.error('Error unfollowing user:', error);
              Alert.alert('Error', 'Failed to unfollow user. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        <View style={styles.leftContent}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <DefaultAvatar size={48} letter={name[0]} />
          )}
          <View style={styles.info}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.username}>{username}</Text>
            <Text style={styles.nativeLanguage}>Native: {nativeLanguage}</Text>
            <View style={styles.languagesContainer}>
              {languages.map((language, index) => (
                <View key={language} style={styles.languageTag}>
                  <Text style={styles.languageText}>{language}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        <View style={styles.rightContent}>
          <View style={styles.streakContainer}>
            <MaterialCommunityIcons name="fire" size={16} color={Colors.light.rust} />
            <Text style={styles.streakText}>{streak} days</Text>
          </View>
          <Pressable onPress={handleUnfollow} style={styles.unfollowButton}>
            <MaterialCommunityIcons name="account-remove" size={20} color={Colors.light.error} />
          </Pressable>
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
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unfollowButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: Colors.light.generalBG,
  },
}); 