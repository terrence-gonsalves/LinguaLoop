import Colors from '@/constants/Colors';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TimeData {
  hours: number;
  minutes: number;
  //seconds: number;
}

interface StatCardProps {
  title: string;
  value: string | TimeData;
  change?: string;
  changeColor?: string;
}

export function StatCard({ title, value, change, changeColor }: StatCardProps) {
  const formatValue = (val: string | TimeData): string => {
    if (typeof val === 'string') {
      return val;
    }
    
    const { hours, minutes } = val;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}m`;
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={styles.value}>{formatValue(value)}</Text>
      {change && (
        <Text style={[styles.change, { color: changeColor || Colors.light.textSecondary }]}>
          {change}
        </Text>
      )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  change: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
}); 