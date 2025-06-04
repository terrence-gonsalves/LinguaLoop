import Colors from '@/constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface ConnectionCardProps {
  name: string;
  username: string;
  nativeLanguage: string;
  interests: string[];
  onMessage: () => void;
}

export function ConnectionCard({ name, username, nativeLanguage, interests, onMessage }: ConnectionCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{name[0]}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.username}>{username}</Text>
        </View>
        <Pressable onPress={onMessage} style={styles.messageButton}>
          <MaterialIcons name="chat" size={20} color={Colors.light.rust} />
        </Pressable>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Native Language:</Text>
          <Text style={styles.value}>{nativeLanguage}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Interests:</Text>
          <Text style={styles.value}>{interests.join(', ')}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.rust,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: Colors.light.textTertiary,
    fontSize: 18,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  username: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  messageButton: {
    padding: 8,
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    width: 120,
  },
  value: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.textPrimary,
  },
}); 