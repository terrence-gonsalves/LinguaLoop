import Colors from '@/constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PerformanceOverviewCardProps {
  averageTime: string;
  changePercent: number;
}

export function PerformanceOverviewCard({ averageTime, changePercent }: PerformanceOverviewCardProps) {
  const isPositive = changePercent >= 0;
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Average Session</Text>
      </View>
      <Text style={styles.value}>{averageTime}</Text>
      <View style={styles.changeContainer}>
        <MaterialIcons
          name={isPositive ? 'arrow-upward' : 'arrow-downward'}
          size={16}
          color={isPositive ? Colors.light.green : Colors.light.error}
        />
        <Text style={[styles.changeText, { color: isPositive ? Colors.light.green : Colors.light.error }]}>
          {Math.abs(changePercent)}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 16,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.textSecondary,
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.textPrimary,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
}); 