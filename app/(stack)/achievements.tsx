import { AchievementItem } from '@/components/profile/AchievementItem';
import AddAchievementModal from '@/components/profile/AddAchievementModal';
import { useAchievements } from '@/hooks/useAchievements';
import { useAuth } from '@/lib/auth-context';
import { Colors } from '@/providers/theme-provider';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AchievementsScreen() {
  const { profile } = useAuth();
  const { achievements, isLoading, error } = useAchievements(profile?.id || '');
  const [showAddAchievement, setShowAddAchievement] = useState(false);

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.rust} />
        </View>
      );
    }

    if (error) {
      return <Text style={styles.errorText}>Error loading achievements: {error}</Text>;
    }

    if (achievements.length === 0) {
      return <Text style={styles.noDataText}>No achievements yet</Text>;
    }

    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return achievements.map((achievement) => {
      const dateToShow = achievement.obtained_date || achievement.created_at;
      const localizedDate = dateToShow
        ? new Date(dateToShow).toLocaleDateString(undefined, { timeZone: userTimeZone, year: 'numeric', month: 'long', day: 'numeric' })
        : '';
      return (
        <AchievementItem
          key={achievement.id}
          title={achievement.title}
          notes={achievement.notes}
          icon={achievement.icon}
          progress={achievement.progress}
          isCompleted={achievement.is_completed}
          date={localizedDate}
        />
      );
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.light.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Achievements</Text>
        <Pressable style={styles.addAchievementButton} onPress={() => setShowAddAchievement(true)}>
          <Text style={styles.addAchievementButtonText}>Add Achievement</Text>
        </Pressable>
      </View>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>
      <AddAchievementModal visible={showAddAchievement} onClose={() => setShowAddAchievement(false)} onAdded={() => setShowAddAchievement(false)} />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.light.background,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: Colors.light.error,
    textAlign: 'center',
    padding: 16,
  },
  noDataText: {
    color: Colors.light.textSecondary,
    textAlign: 'center',
    padding: 16,
  },
  addAchievementButton: {
    backgroundColor: Colors.light.buttonPrimary,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 5,
    marginLeft: 8,
  },
  addAchievementButtonText: {
    color: Colors.light.background,
    fontSize: 14,
    fontWeight: '600',
  },
}); 