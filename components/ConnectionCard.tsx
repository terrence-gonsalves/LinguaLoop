import { Image as ExpoImage } from 'expo-image';
import { router } from 'expo-router';

import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import DefaultAvatar from '@/components/DefaultAvatar';

import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { showErrorToast } from '@/lib/toast';

import { Colors } from '@/providers/theme-provider';

export interface ConnectionCardProps {
  userId: string;
  name: string;
  username: string;
  nativeLanguage: string;
  avatarUrl?: string;
  aboutMe: string;
  onUnfollow?: () => void;
}

export default function ConnectionCard({
  userId,
  name,
  username,
  nativeLanguage,
  avatarUrl,
  aboutMe,
  onUnfollow,
}: ConnectionCardProps) {
  const [imageError, setImageError] = useState(false);
  const { profile } = useAuth();

  const handleUnfollow = () => {
    Alert.alert('Unfollow User', `Are you sure you want to unfollow ${name}?`, [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Unfollow',
        style: 'destructive',
        onPress: async () => {
          try {
            const { data, error } = await supabase
              .from('follows')
              .delete()
              .match({
                follower_id: profile?.id,
                following_id: userId,
              })
              .select('follower_id');

            if (error) throw error;
            if (!data || data.length === 0) throw new Error('No follow was deleted');

            // call the callback to refresh the connections list
            onUnfollow?.();
          } catch (error) {
            console.error('Error unfollowing user:', error);
            showErrorToast('Failed to unfollow user. Please try again.');
          }
        },
      },
    ]);
  };

  const handlePress = () => {
    router.push(`/(stack)/profile/${userId}`);
  };

  return (
    <View style={styles.card}>
      <Pressable
        style={({ pressed }) => [styles.cardContent, pressed && { opacity: 0.7 }]}
        onPress={handlePress}
      >
        <View style={styles.avatarContainer}>
          {avatarUrl && !imageError ? (
            <ExpoImage
              source={{ uri: avatarUrl }}
              style={styles.avatar}
              contentFit="cover"
              transition={200}
              onError={() => setImageError(true)}
            />
          ) : (
            <DefaultAvatar size={40} letter={name?.[0] || '?'} />
          )}
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          {username && <Text style={styles.username}>@{username}</Text>}
          <Text style={styles.language}>{nativeLanguage}</Text>
          <Text style={styles.aboutMe} numberOfLines={2}>
            {aboutMe}
          </Text>
        </View>
      </Pressable>
      <Pressable style={styles.unfollowButton} onPress={handleUnfollow}>
        <Text style={styles.unfollowButtonText}>Unfollow</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  cardContent: {
    flexDirection: 'row',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.textPrimary,
  },
  username: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  language: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  aboutMe: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  unfollowButton: {
    backgroundColor: Colors.light.generalBG,
    borderWidth: 1,
    borderColor: Colors.light.buttonPrimary,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 12,
  },
  unfollowButtonText: {
    color: Colors.light.buttonPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
});
