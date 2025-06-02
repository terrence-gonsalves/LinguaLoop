import { Colors } from '@/constants/Colors';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import DefaultAvatar from '../DefaultAvatar';

interface ConnectionCardProps {
  name: string;
  username: string;
  nativeLanguage: string;
  interests: string[];
  imageUrl?: string;
  onMessage: () => void;
}

export function ConnectionCard({ name, username, nativeLanguage, interests, imageUrl, onMessage }: ConnectionCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.avatar} />
        ) : (
          <DefaultAvatar size={40} />
        )}
        <View style={styles.details}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.nativeLanguage}>Native: {nativeLanguage}</Text>
        </View>
      </View>
      <View style={styles.interestsContainer}>
        {interests.map((interest, index) => (
          <View key={index} style={styles.interestTag}>
            <Text style={styles.interestText}>{interest}</Text>
          </View>
        ))}
      </View>
      <Pressable style={styles.messageButton} onPress={onMessage}>
        <Text style={styles.messageButtonText}>Message</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  details: {
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
    marginBottom: 2,
  },
  nativeLanguage: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 12,
  },
  interestTag: {
    backgroundColor: Colors.light.ice,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  interestText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  messageButton: {
    backgroundColor: Colors.light.rust,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  messageButtonText: {
    color: Colors.light.background,
    fontSize: 14,
    fontWeight: '600',
  },
}); 