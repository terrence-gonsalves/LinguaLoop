import Colors from '@/constants/Colors';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { ChartCard } from './ChartCard';

const screenWidth = Dimensions.get('window').width;

interface LegendItemProps {
  color: string;
  text: string;
}

const LegendItem = ({ color, text }: LegendItemProps) => (
  <View style={styles.legendItem}>
    <View style={[styles.legendColor, { backgroundColor: color }]} />
    <Text style={styles.legendText}>{text}</Text>
  </View>
);

interface ComparisonCardProps {
  title: string;
  subtitle: string;
  items: { text: string; color: string }[];
  analysisData: {
    data: number[];
    total: number;
  }
}

export function ComparisonCard({ title, subtitle, items, analysisData }: ComparisonCardProps) {
  
  const pieChartData = items.map((item, index) => ({
    name: item.text,
    population: analysisData.data[index] || 0,
    color: item.color,
    legendFontColor: Colors.light.textSecondary,
    legendFontSize: 14,
  }));
  
  return (
    <ChartCard title={title} subtitle={subtitle}>
      <View style={styles.chartContainer}>
        {analysisData.total > 0 ? (
          <PieChart
            data={pieChartData}
            width={screenWidth - 64}
            height={150}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="0"
            hasLegend={false}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No data available</Text>
          </View>
        )}
      </View>
      <View style={styles.legendContainer}>
        {items.map((item, index) => (
          <LegendItem key={index} color={item.color} text={item.text} />
        ))}
      </View>
    </ChartCard>
  );
}

const styles = StyleSheet.create({
  chartContainer: {
    height: 150,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataContainer: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
}); 