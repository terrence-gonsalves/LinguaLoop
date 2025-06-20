import Colors from '@/constants/Colors';
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
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  const comparisonItems1 = [
    { text: 'Input', color: Colors.light.rust },
    { text: 'Output', color: Colors.light.fossil },
  ];

  const comparisonItems2 = [
    { text: 'Interactive', color: Colors.light.rust },
    { text: 'Freeform', color: Colors.light.fossil },
    { text: 'Preparation', color: Colors.light.sand },
  ];

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
                data={languages}
                value={selectedLanguage}
                onChange={setSelectedLanguage}
              />
            </View>
          ),
        }}
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statRow}>
          <StatCard title="Total time" value="0:00:00" />
          <PerformanceOverviewCard averageTime="45 Mins" changePercent={12} />
        </View>

        <MilestoneTrackerCard nextMilestone={50} remaining={50} />

        <TimeDistributionCard />

        <StudyProgressCard />

        <TimePerSkillCard />

        <ComparisonCard title="Input vs Output" items={comparisonItems1} />
        <ComparisonCard title="Interactive vs Freeform vs Preparation" items={comparisonItems2} />

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
    width: 150,
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