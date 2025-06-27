import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Stack } from 'expo-router/stack';
import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LanguageProgressCard } from '@/components/profile/LanguageProgressCard';
import Colors from '@/constants/Colors';
import { useLanguageSummary } from '@/hooks/useLanguageSummary';
import { useAuth } from '@/lib/auth-context';

export default function LanguagesScreen() {
  const { profile } = useAuth();
  const { languages, isLoading, error } = useLanguageSummary(profile?.id || '');

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.rust} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading languages: {error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color={Colors.light.textPrimary} />
            </Pressable>
            <Text style={styles.headerTitle}>All Languages</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.section}>
            <View style={styles.languageCards}>
              {languages.map((language, index) => (
                <LanguageProgressCard 
                  key={language.id} 
                  language={language.name}
                  level={language.level}
                  activities={language.activities}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
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
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    flex: 1,
    marginLeft: 16,
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
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  languageCards: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: Colors.light.error,
    fontSize: 16,
    fontWeight: '600',
  },
}); 