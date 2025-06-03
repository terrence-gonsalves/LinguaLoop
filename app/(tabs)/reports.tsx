import { Colors } from '@/constants/Colors';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ActivityData {
  name: string;
  population: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

interface WeeklyData {
  x: string;
  y: number;
}

interface Insight {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description: string;
}

const screenWidth = Dimensions.get('window').width;

const activityData: ActivityData[] = [
  { 
    name: "Speaking",
    population: 20,
    color: '#4CAF50',
    legendFontColor: Colors.light.textSecondary,
    legendFontSize: 14
  },
  { 
    name: "Listening",
    population: 30,
    color: '#E91E63',
    legendFontColor: Colors.light.textSecondary,
    legendFontSize: 14
  },
  { 
    name: "Writing",
    population: 10,
    color: '#5C6BC0',
    legendFontColor: Colors.light.textSecondary,
    legendFontSize: 14
  },
  { 
    name: "Reading",
    population: 40,
    color: '#7E57C2',
    legendFontColor: Colors.light.textSecondary,
    legendFontSize: 14
  },
];

const weeklyLabels = ['Week 1', 'Week 2', 'Week 4', 'Week 5'];
const weeklyValues = [5, 6, 8, 10];

const insights: Insight[] = [
  {
    icon: 'microphone',
    title: 'Increase Speaking Practice',
    description: 'Your speaking activity is below target. Aim for 30 minutes daily to improve fluency.',
  },
  {
    icon: 'book-open-page-variant',
    title: 'Review Core Vocabulary',
    description: 'Focus on reviewing common vocabulary from your last 5 lessons for better retention.',
  },
  {
    icon: 'lightbulb',
    title: 'Explore New Resources',
    description: 'Consider incorporating podcasts or native shows to boost listening comprehension.',
  },
];

const chartConfig = {
  backgroundColor: Colors.light.background,
  backgroundGradientFrom: Colors.light.background,
  backgroundGradientTo: Colors.light.background,
  color: (opacity = 1) => `rgba(217, 125, 84, ${opacity})`,
  labelColor: (opacity = 1) => Colors.light.textSecondary,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
  decimalPlaces: 0,
  style: {
    borderRadius: 16,
  },
  propsForLabels: {
    fontSize: 12,
  },
};

export default function ReportsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Reports</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={20} color={Colors.light.textSecondary} />
            <TextInput
              placeholder="Filter Reports by Date"
              style={styles.searchInput}
              placeholderTextColor={Colors.light.textSecondary}
            />
          </View>

          <Text style={styles.sectionTitle}>Performance Overview</Text>
          <View style={styles.averageSessionCard}>
            <View style={styles.trendIndicator}>
              <MaterialIcons name="trending-up" size={16} color={Colors.light.background} />
              <Text style={styles.trendText}>12%</Text>
            </View>
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionLabel}>Average Session</Text>
              <Text style={styles.sessionValue}>45</Text>
              <Text style={styles.sessionUnit}>Mins</Text>
            </View>
            <View style={styles.trendIndicator}>
              <MaterialIcons name="trending-up" size={16} color={Colors.light.background} />
              <Text style={styles.trendText}>8%</Text>
            </View>
          </View>

          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Time Distribution by Activity</Text>
            <Text style={styles.chartSubtitle}>How your study time is distributed across activities.</Text>
            <View style={styles.pieChartContainer}>
              <PieChart
                data={activityData}
                width={screenWidth - 64}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="0"
                absolute
              />
            </View>
          </View>

          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Weekly Study Progress</Text>
            <Text style={styles.chartSubtitle}>Your consistency in language learning over weeks.</Text>
            <View style={styles.lineChartContainer}>
              <LineChart
                data={{
                  labels: weeklyLabels,
                  datasets: [{
                    data: weeklyValues
                  }]
                }}
                width={screenWidth - 64}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
            </View>
          </View>

          <View style={styles.insightsSection}>
            <Text style={styles.chartTitle}>Key Insights & Focus Areas</Text>
            <Text style={styles.chartSubtitle}>Actionable tips to boost your learning.</Text>
            {insights.map((insight, index) => (
              <View key={index} style={styles.insightCard}>
                <MaterialCommunityIcons name={insight.icon} size={24} color={Colors.light.rust} />
                <View style={styles.insightContent}>
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                  <Text style={styles.insightDescription}>{insight.description}</Text>
                </View>
              </View>
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
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: 24,
  },
  section: {
    paddingHorizontal: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: Colors.light.textPrimary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: 16,
  },
  averageSessionCard: {
    backgroundColor: Colors.light.rust,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    color: Colors.light.background,
    marginLeft: 4,
    fontWeight: '500',
  },
  sessionInfo: {
    alignItems: 'center',
  },
  sessionLabel: {
    color: Colors.light.background,
    fontSize: 14,
    marginBottom: 4,
  },
  sessionValue: {
    color: Colors.light.background,
    fontSize: 36,
    fontWeight: 'bold',
  },
  sessionUnit: {
    color: Colors.light.background,
    fontSize: 16,
  },
  chartSection: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 16,
  },
  pieChartContainer: {
    alignItems: 'center',
  },
  lineChartContainer: {
    marginVertical: 16,
  },
  insightsSection: {
    marginBottom: 24,
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  insightContent: {
    flex: 1,
    marginLeft: 16,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
}); 