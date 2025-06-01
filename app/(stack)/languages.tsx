import { LanguageProgressCard } from '@/components/profile/LanguageProgressCard';
import { Colors } from '@/constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const languages = [
  {
    language: 'Spanish',
    level: 'Intermediate',
    progress: 75,
    words: 2345,
    lessons: 15,
  },
  {
    language: 'Japanese',
    level: 'Beginner',
    progress: 40,
    words: 860,
    lessons: 12,
  },
  {
    language: 'French',
    level: 'Beginner',
    progress: 15,
    words: 230,
    lessons: 4,
  },
  {
    language: 'German',
    level: 'Not Started',
    progress: 0,
    words: 0,
    lessons: 0,
  },
];

export default function LanguagesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.light.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>My Languages</Text>
        <Pressable style={styles.addButton}>
          <MaterialIcons name="add" size={24} color={Colors.light.textPrimary} />
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Languages</Text>
          <View style={styles.languageGrid}>
            {languages.filter(lang => lang.progress > 0).map((language, index) => (
              <LanguageProgressCard key={index} {...language} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Languages</Text>
          <View style={styles.languageGrid}>
            {languages.filter(lang => lang.progress === 0).map((language, index) => (
              <LanguageProgressCard key={index} {...language} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.generalBG,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  backButton: {
    padding: 8,
  },
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: 16,
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
}); 