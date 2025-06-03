import { Colors } from '@/constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConnectionCard } from '../../components/profile/ConnectionCard';

const connections = [
  {
    name: 'Sarah Johnson',
    username: '@sarah.j',
    nativeLanguage: 'French',
    interests: ['English', 'Travel', 'Culture'],
  },
  {
    name: 'David Lee',
    username: '@david.lingua',
    nativeLanguage: 'Mandarin',
    interests: ['Spanish', 'Tech', 'Music'],
  },
  {
    name: 'Maria Garcia',
    username: '@maria.g',
    nativeLanguage: 'Spanish',
    interests: ['Japanese', 'Art', 'Food'],
  },
  {
    name: 'Yuki Tanaka',
    username: '@yuki.t',
    nativeLanguage: 'Japanese',
    interests: ['English', 'Gaming', 'Anime'],
  },
];

export default function ConnectionsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.light.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Language Partners</Text>
        <Pressable style={styles.searchButton}>
          <MaterialIcons name="search" size={24} color={Colors.light.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color={Colors.light.textSecondary} />
          <TextInput
            placeholder="Search by language, interests..."
            style={styles.searchInput}
            placeholderTextColor={Colors.light.textSecondary}
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Connections</Text>
          <View style={styles.connectionGrid}>
            {connections.slice(0, 2).map((connection, index) => (
              <ConnectionCard
                key={index}
                {...connection}
                onMessage={() => {}}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suggested Partners</Text>
          <View style={styles.connectionGrid}>
            {connections.slice(2).map((connection, index) => (
              <ConnectionCard
                key={index}
                {...connection}
                onMessage={() => {}}
              />
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
  searchButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: Colors.light.textPrimary,
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
  connectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
}); 