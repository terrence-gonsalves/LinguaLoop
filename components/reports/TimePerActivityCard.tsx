import Colors from '@/constants/Colors';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { ChartCard } from './ChartCard';

const screenWidth = Dimensions.get('window').width;

interface TimePerActivityData {
  labels: string[];
  data: number[];
}

interface TimePerActivityCardProps {
  timePerActivityData: TimePerActivityData;
}

export function TimePerActivityCard({ timePerActivityData }: TimePerActivityCardProps) {

  const chartData = {
    labels: timePerActivityData.labels,
    datasets: [
      {
        data: timePerActivityData.data.length > 0 ? timePerActivityData.data : [0, 0, 0, 0],
      },
    ],
  };

  const allDataIsZero = timePerActivityData.data.every(d => d === 0);

  return (
    <ChartCard title="Time per Activity" subtitle="Comparison of time spent on each activity">
      {allDataIsZero ? (
        <View style={styles.emptyContainer}>
            <BarChart
                data={{
                    labels: chartData.labels,
                    datasets: [{
                        data: [0, 0, 0, 0]
                    }]
                }}
                width={screenWidth - 64}
                height={250}
                yAxisLabel=""
                yAxisSuffix="h"
                chartConfig={chartConfig}
                fromZero
                showValuesOnTopOfBars={false}
                withInnerLines={false}
            />
            <Text style={styles.emptyText}>No time tracked yet.</Text>
        </View>
      ) : (
        <BarChart
          data={chartData}
          width={screenWidth - 64}
          height={250}
          yAxisLabel=""
          yAxisSuffix="h"
          chartConfig={chartConfig}
          verticalLabelRotation={0}
          fromZero
        />
      )}
    </ChartCard>
  );
}

const chartConfig = {
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
};

const styles = StyleSheet.create({
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 250
    },
    emptyText: {
        position: 'absolute',
        fontSize: 16,
        color: Colors.light.textSecondary,
    }
}); 