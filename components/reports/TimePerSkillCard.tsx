import Colors from '@/constants/Colors';
import React from 'react';
import { Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { ChartCard } from './ChartCard';

const screenWidth = Dimensions.get('window').width;

const data = {
  labels: ['Speaking', 'Writing', 'Reading', 'Listening'],
  datasets: [
    {
      data: [5, 8, 3, 10],
    },
  ],
};

export function TimePerSkillCard() {
  return (
    <ChartCard title="Time per Skill" subtitle="Comparison of time spent on each skill">
      <BarChart
        data={data}
        width={screenWidth - 64}
        height={250}
        yAxisLabel=""
        yAxisSuffix="h"
        chartConfig={{
          backgroundColor: Colors.light.background,
          backgroundGradientFrom: Colors.light.background,
          backgroundGradientTo: Colors.light.background,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(217, 125, 84, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForLabels: {
            fontSize: 11,
          }
        }}
        verticalLabelRotation={0}
        fromZero
      />
    </ChartCard>
  );
} 