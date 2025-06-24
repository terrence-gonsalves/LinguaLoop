import DefaultAvatar from '@/components/DefaultAvatar';
import { Colors } from '@/providers/theme-provider';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View } from 'react-native';

interface ProfileConnectionCardProps {
  name: string;
  languages: string[];
  streak: number;
  avatarUrl?: string;
  nativeLanguage?: string;
  username?: string;
}

export function ProfileConnectionCard({ 
  name, 
  languages, 
  streak, 
  avatarUrl,
  nativeLanguage = 'French',
  username = '@sarah.j'
}: ProfileConnectionCardProps) {
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
}); 