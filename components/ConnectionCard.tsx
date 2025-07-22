import { Image as ExpoImage } from 'expo-image';
import { router } from 'expo-router';

import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import DefaultAvatar from '@/components/DefaultAvatar';

export interface ConnectionCardProps {
  userId: string;
  name: string;
  username: string;
  nativeLanguage: string;
  avatarUrl?: string;
  aboutMe: string;
}

export default function ConnectionCard({ userId, name, username, nativeLanguage, avatarUrl, aboutMe }: ConnectionCardProps) {
  const [imageError, setImageError] = useState(false);

  const handlePress = () => {
    router.push(`/(stack)/profile/${userId}`);
  };

  return (
    <Pressable 
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.7 }
      ]} 
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
        <Text style={styles.aboutMe} numberOfLines={2}>{aboutMe}</Text>
      </View>
    </Pressable>
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
  },
  username: {
    fontSize: 14,
    color: '#666',
  },
  language: {
    fontSize: 14,
    color: '#444',
    marginTop: 4,
  },
  aboutMe: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
}); 