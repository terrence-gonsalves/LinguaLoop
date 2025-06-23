import Colors from '@/constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface InsightItemProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
}

const InsightItem = ({ icon, title, description }: InsightItemProps) => (
  <View style={styles.item}>
    <MaterialIcons name={icon} size={24} color={Colors.light.rust} style={styles.icon} />
    <View style={styles.textContainer}>
      <Text style={styles.itemTitle}>{title}</Text>
      <Text style={styles.itemDescription}>{description}</Text>
    </View>
  </View>
);

export function KeyInsightsCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Key Insights & Focus Areas</Text>
      <InsightItem
        icon="mic"
        title="Increase Speaking Practice"
        description="Your speaking activity is below target. Aim for 30 minutes daily to improve fluency."
      />
      <InsightItem
        icon="rate-review"
        title="Review Core Vocabulary"
        description="Actionable insights from your last 5 lessons for better retention."
      />
      <InsightItem
        icon="explore"
        title="Explore New Resources"
        description="Check out native TV shows to boost listening comprehension."
      />
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.textPrimary,
    marginBottom: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  icon: {
    marginRight: 16,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
}); 