import Colors from '@/constants/Colors';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { ChartCard } from './ChartCard';

const screenWidth = Dimensions.get('window').width;

const data = {
  labels: ['1', '2', '3', '4', '5', '6'],
  datasets: [
    {
      data: [3, 5, 9, 7, 8, 12],
      color: (opacity = 1) => `rgba(217, 125, 84, ${opacity})`, // optional
      strokeWidth: 2, // optional
    },
  ],
};

export function StudyProgressCard() {
  return (
    <ChartCard title="Weekly Study Progress" subtitle="Your consistency in language learning">
      <View style={styles.container}>
        <LineChart
          data={data}
          width={screenWidth - 64}
          height={220}
          yAxisSuffix="h"
          chartConfig={{
            backgroundColor: Colors.light.background,
            backgroundGradientFrom: Colors.light.background,
            backgroundGradientTo: Colors.light.background,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForLabels: {
              fontSize: '12',
            }
          }}
          bezier
        />
        <Text style={styles.xAxisLabel}>Weeks</Text>
      </View>
    </ChartCard>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingLeft: 20, // add padding to make space for Y-axis label
  },
  yAxisLabel: {
    position: 'absolute',
    left: 0,
    top: '45%',
    transform: [{ rotate: '-90deg' }],
    color: Colors.light.textSecondary,
    fontSize: 12,
  },
  xAxisLabel: {
    marginTop: 10,
    color: Colors.light.textSecondary,
    fontSize: 12,
  },
}); 