import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../app/providers/theme-provider';
import DefaultAvatar from '../DefaultAvatar';

interface ConnectionCardProps {
  name: string;
  languages: string[];
  streak: number;
  avatarUrl?: string;
}

export function ConnectionCard({ name, languages, streak, avatarUrl }: ConnectionCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <DefaultAvatar size={48} letter={name[0]} />
        )}
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.languages}>{languages.join(' • ')}</Text>
        </View>
      </View>
      <View style={styles.streakContainer}>
        <MaterialCommunityIcons name="fire" size={20} color={Colors.light.rust} />
        <Text style={styles.streakText}>{streak} days</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.background,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  languages: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.generalBG,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  streakText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
  },
}); 