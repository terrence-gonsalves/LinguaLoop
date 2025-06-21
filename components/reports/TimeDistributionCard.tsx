import Colors from '@/constants/Colors';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { ProgressChart } from 'react-native-chart-kit';
import { ChartCard } from './ChartCard';

const screenWidth = Dimensions.get('window').width;

// data structure: { labels: ["Swim", "Bike", "Run"], data: [0.4, 0.6, 0.8] }
const data = {
  labels: ['Reading', 'Writing', 'Speaking', 'Listening'], // optional
  data: [0.25, 0.25, 0.2, 0.3],
};

const chartConfig = {
  backgroundGradientFrom: Colors.light.background,
  backgroundGradientTo: Colors.light.background,
  color: (opacity = 1, index = 0) => {
    const shades = [
      'rgba(48, 51, 64, 0.8)',  // darker shade
      'rgba(48, 51, 64, 0.6)',
      'rgba(48, 51, 64, 0.4)',
      'rgba(48, 51, 64, 0.2)',  // lighter shade
    ];
    
    // to ensure darkest is on the outside, reverse the index mapping
    const reversedIndex = data.data.length - 1 - index;
    return shades[reversedIndex] ?? `rgba(48, 51, 64, ${opacity})`;
  },
  labelColor: (opacity = 1) => `rgba(127, 127, 127, ${opacity})`,
  strokeWidth: 2, // optional, default 3
  useShadowColorFromDataset: false, // optional
};


export function TimeDistributionCard() {

  // calculate total population for percentage calculation
  const totalPopulation = data.data.reduce((sum, value) => sum + value, 0) * 100;

  return (
    <ChartCard title="Time Distribution" subtitle="Breakdown of total study time by activity">
      <View style={styles.container}>
        <View style={styles.chartWrapper}>
          <ProgressChart
            data={data}
            width={screenWidth - 160} // Made chart smaller
            height={200}
            strokeWidth={12}
            radius={32}
            chartConfig={chartConfig}
            hideLegend={true}
          />
        </View>
        <View style={styles.legendContainer}>
          {data.labels.map((label, index) => {
            const percentage = data.data[index] * 100;
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