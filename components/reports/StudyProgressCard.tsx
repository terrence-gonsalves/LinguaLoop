import Colors from '@/constants/Colors';
import React from 'react';
import { Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { ChartCard } from './ChartCard';

const screenWidth = Dimensions.get('window').width;

const data = {
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
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
      <LineChart
        data={data}
        width={screenWidth - 64}
        height={220}
        chartConfig={{
          backgroundColor: Colors.light.background,
          backgroundGradientFrom: Colors.light.background,
          backgroundGradientTo: Colors.light.background,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        bezier
      />
    </ChartCard>
  );
} 