import Colors from '@/constants/Colors';
import { useReportsData } from '@/hooks/useReportsData';
import { useUserLanguages } from '@/hooks/useUserLanguages';
import { useAuth } from '@/lib/auth-context';
import { Stack } from 'expo-router/stack';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LanguageDropdown } from '../../components/forms/LanguageDropdown';
import { ComparisonCard } from '../../components/reports/ComparisonCard';
import { KeyInsightsCard } from '../../components/reports/KeyInsightsCard';
import { MilestoneTrackerCard } from '../../components/reports/MilestoneTrackerCard';
import { PerformanceOverviewCard } from '../../components/reports/PerformanceOverviewCard';
import { StatCard } from '../../components/reports/StatCard';
import { StudyProgressCard } from '../../components/reports/StudyProgressCard';
import { TimeDistributionCard } from '../../components/reports/TimeDistributionCard';
import { TimePerSkillCard } from '../../components/reports/TimePerSkillCard';

export default function ReportsScreen() {
  const { profile } = useAuth();
  const { languages } = useUserLanguages(profile?.id || '');
  const [selectedLanguageId, setSelectedLanguageId] = useState<string | null>(null);
  const { data: reportsData, isLoading } = useReportsData(profile?.id, selectedLanguageId);

  const comparisonItems1 = [
    { text: 'Input', color: Colors.light.rust },
    { text: 'Output', color: Colors.light.fossil },
  ];

  const comparisonItems2 = [
    { text: 'Interactive', color: Colors.light.rust },
    { text: 'Freeform', color: Colors.light.fossil },
    { text: 'Preparation', color: Colors.light.sand },
  ];

  // transform languages for dropdown with IDs
  const languageOptions = languages.map(lang => ({
    ...lang,
    id: lang.id, // ensure ID is available for filtering
  }));

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Reports',
          headerStyle: { backgroundColor: Colors.light.background },
          headerShadowVisible: false,
          headerRight: () => (
            <View style={styles.headerRight}>
              <LanguageDropdown
                label=""
                data={languageOptions}
                value={selectedLanguageId}
                onChange={setSelectedLanguageId}
                displayMode="flagOnly"
                showAllLanguagesOption
              />
            </View>
          ),
        }}
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statRow}>
          <StatCard 
            title="Total Time" 
            value={reportsData.totalTime} 
          />
          <PerformanceOverviewCard 
            averageTimeSeconds={reportsData.averageSession.currentDay}
            changePercent={reportsData.averageSession.changePercent}
          />
        </View>

        <MilestoneTrackerCard milestoneData={reportsData.milestone} />

        <TimeDistributionCard />

        <StudyProgressCard />

        <TimePerSkillCard />

        <ComparisonCard 
          title="Input-Output Analysis" 
          subtitle="Comparison of input and output activities" 
          items={comparisonItems1} 
        />

        <KeyInsightsCard />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  headerRight: {
    marginRight: 16,
  },
  content: {
    paddingHorizontal: 16,
  },
  statRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
}); 