import Colors from '@/constants/Colors';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { ProgressChart } from 'react-native-chart-kit';
import { ChartCard } from './ChartCard';

const screenWidth = Dimensions.get('window').width;

interface TimeDistributionData {
  labels: string[];
  data: number[];
  activityColors: string[];
}

interface TimeDistributionCardProps {
  timeDistributionData: TimeDistributionData;
}

export function TimeDistributionCard({ timeDistributionData }: TimeDistributionCardProps) {
  const { labels, data, activityColors } = timeDistributionData;

  const chartData = {
    labels: labels,
    data: data.length > 0 ? data : [0.25, 0.25, 0.25, 0.25], // provide default data for empty state
  };

  const chartConfig = {
    backgroundGradientFrom: Colors.light.background,
    backgroundGradientTo: Colors.light.background,
    color: (opacity = 1, index = 0) => {
      const hasData = data && data.length > 0 && data[index] > 0;

      if (hasData) {
        return activityColors[index] ?? 'rgba(48, 51, 64, 0.8)';
      }
      
      const shades = [
        'rgba(48, 51, 64, 0.2)',  // lighter shade
        'rgba(48, 51, 64, 0.4)',
        'rgba(48, 51, 64, 0.6)',
        'rgba(48, 51, 64, 0.8)',  // darker shade
      ];
      
      return shades[index % shades.length] ?? `rgba(48, 51, 64, ${opacity})`;
    },
    labelColor: (opacity = 1) => `rgba(127, 127, 127, ${opacity})`,
    strokeWidth: 2,
    useShadowColorFromDataset: false,
  };

  const legendLabels = labels.length > 0 ? labels : ['Reading', 'Writing', 'Speaking', 'Listening'];

  return (
    <ChartCard title="Time Distribution" subtitle="Breakdown of total study time by activity">
      <View style={styles.container}>
        <View style={styles.chartWrapper}>
          <ProgressChart
            data={chartData}
            width={screenWidth - 160}
            height={200}
            strokeWidth={12}
            radius={32}
            chartConfig={chartConfig}
            hideLegend={true}
          />
        </View>
        <View style={styles.legendContainer}>
          {legendLabels.map((label, index) => {
            const percentage = (data && data.length > 0) ? (data[index] || 0) * 100 : 0;
            return (
              <View key={label} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: chartConfig.color(1, index) }]} />
                <Text style={styles.legendText}>{label}</Text>
                <Text style={styles.legendPercentage}>{percentage.toFixed(0)}%</Text>
              </View>
            );
          })}
        </View>
      </View>
    </ChartCard>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  chartWrapper: {
    marginBottom: 20,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 10,
    paddingLeft: '15%',
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    width: 60,
  },
  legendPercentage: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.light.textPrimary,
  }
}); 