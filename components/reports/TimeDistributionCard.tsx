import Colors from '@/constants/Colors';
import React from 'react';
import { Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { ChartCard } from './ChartCard';

const screenWidth = Dimensions.get('window').width;

const data = [
  { name: 'Listening', population: 30, color: Colors.light.rust, legendFontColor: '#7F7F7F', legendFontSize: 15 },
  { name: 'Speaking', population: 20, color: '#F00', legendFontColor: '#7F7F7F', legendFontSize: 15 },
  { name: 'Reading', population: 25, color: '#2e7d32', legendFontColor: '#7F7F7F', legendFontSize: 15 },
  { name: 'Writing', population: 25, color: '#6a1b9a', legendFontColor: '#7F7F7F', legendFontSize: 15 },
];

export function TimeDistributionCard() {
  return (
    <ChartCard title="Time Distribution by Activity" subtitle="How your study time is distributed">
      <PieChart
        data={data}
        width={screenWidth - 64}
        height={220}
        chartConfig={{
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        center={[10, 10]}
        absolute
      />
    </ChartCard>
  );
} 