import Colors from '@/constants/Colors';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface MilestoneTrackerCardProps {
  nextMilestone: number;
  remaining: number;
}

export function MilestoneTrackerCard({ nextMilestone, remaining }: MilestoneTrackerCardProps) {
  const completedHours = Math.max(0, nextMilestone - remaining);
  const progressPercentage = nextMilestone > 0 ? (completedHours / nextMilestone) * 100 : 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Hour Milestones</Text>
      </View>
      <Text style={styles.subtitle}>
        Next Milestone: <Text style={styles.bold}>{nextMilestone}h</Text>
      </Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}><Text style={styles.bold}>{completedHours.toFixed(1)}h</Text> completed</Text>
          <Text style={styles.progressText}><Text style={styles.bold}>{remaining.toFixed(1)}h</Text> remaining</Text>
        </View>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.labelText}>0h</Text>
          <Text style={styles.labelText}>{nextMilestone}h</Text>
        </View>
      </View>

      <Text style={styles.footerText}>
        You are not on track to reach the next milestone unless you start tracking some time.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  header: {
    width: '100%',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 24,
    width: '100%',
  },
  bold: {
    fontWeight: 'bold',
    color: Colors.light.textPrimary,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 24,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: Colors.light.generalBG,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.light.rust,
    borderRadius: 6,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  labelText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  footerText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
}); 