import DefaultAvatar from '@/components/DefaultAvatar';
import { Image as ExpoImage } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

export interface ConnectionCardProps {
  name: string;
  username: string;
  nativeLanguage: string;
  avatarUrl?: string;
  aboutMe: string;
}

export default function ConnectionCard({ name, username, nativeLanguage, avatarUrl, aboutMe }: ConnectionCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.avatarContainer}>
        {avatarUrl ? (
          <ExpoImage
            source={{ uri: avatarUrl }}
            style={styles.avatar}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <DefaultAvatar size={40} letter={name?.[0] || '?'} />
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.username}>@{username}</Text>
        <Text style={styles.language}>{nativeLanguage}</Text>
        <Text style={styles.aboutMe} numberOfLines={2}>{aboutMe}</Text>
      </View>
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