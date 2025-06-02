import { Colors } from '@/constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface AchievementItemProps {
  date: string;
  title: string;
  description: string;
  onReview: () => void;
}

export function AchievementItem({ date, title, description, onReview }: AchievementItemProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name="trophy" size={24} color={Colors.light.rust} />
      </View>
      <View style={styles.content}>
        <Text style={styles.date}>{date}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <Pressable onPress={onReview}>
          <Text style={styles.reviewLink}>Review {'>'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.ice,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  date: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  reviewLink: {
    fontSize: 14,
    color: Colors.light.rust,
    fontWeight: '600',
  },
}); 