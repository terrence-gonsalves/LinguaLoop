import { Image as ExpoImage } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../../app/providers/theme-provider';
import DefaultAvatar from '../../../components/DefaultAvatar';

export interface ConnectionCardProps {
  name: string;
  username: string;
  nativeLanguage: string;
  avatarUrl: string;
  aboutMe: string;
}

export function ConnectionCard({ name, username, nativeLanguage, avatarUrl, aboutMe }: ConnectionCardProps) {
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
          <DefaultAvatar size={50} letter={(name || username)[0] || '?'} />
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{name || username || 'Anonymous User'}</Text>
        <Text style={styles.username}>@{username || 'username'}</Text>
        <Text style={styles.language}>Native: {nativeLanguage}</Text>
        {aboutMe && <Text style={styles.bio} numberOfLines={2}>{aboutMe}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  avatarContainer: {
    marginRight: 16,
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
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  language: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  bio: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    lineHeight: 16,
  },
}); 