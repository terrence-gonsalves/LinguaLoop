import Colors from '@/constants/Colors';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ChartCard } from './ChartCard';

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
}

export function ComparisonCard({ title, subtitle, items }: ComparisonCardProps) {
  return (
    <ChartCard title={title} subtitle={subtitle}>
      <View style={styles.container}>
        <Text style={styles.noDataText}>No data available</Text>
        <View style={styles.legendContainer}>
          {items.map((item, index) => (
            <LegendItem key={index} color={item.color} text={item.text} />
          ))}
        </View>
      </View>
    </ChartCard>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
  },
  noDataText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginBottom: 24,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
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