import Colors from '@/constants/Colors';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  onMenuPress?: () => void;
  children: React.ReactNode;
}

export function ChartCard({ title, subtitle, onMenuPress, children }: ChartCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.chartContainer}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.textSecondary,
    marginBottom: 2,
  },
  icons: {
    flexDirection: 'row',
    gap: 12,
  },
  chartContainer: {
    marginTop: 16,
  },
}); 