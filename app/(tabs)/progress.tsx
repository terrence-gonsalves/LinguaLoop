import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Card } from 'react-native-elements';
import { LineChart, ProgressChart } from 'react-native-chart-kit';

const ProgressScreen = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('Spanish');
  
  // Mock data - replace with actual data from your app's state management
  const languages = ['Spanish', 'French', 'German', 'Japanese'];
  const progressData = {
    Spanish: {
      overallProgress: 0.65,
      vocabularyProgress: 0.8,
      grammarProgress: 0.6,
      listeningProgress: 0.7,
      speakingProgress: 0.5,
      weeklyActivity: [2, 3, 1, 4, 2, 3, 5],
    },
    French: {
      overallProgress: 0.4,
      vocabularyProgress: 0.5,
      grammarProgress: 0.3,
      listeningProgress: 0.4,
      speakingProgress: 0.3,
      weeklyActivity: [1, 2, 1, 3, 1, 2, 4],
    },
    // Add data for other languages...
  };

  const currentProgress = progressData[selectedLanguage];

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
    strokeWidth: 2,
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Language Progress</Text>
      </View>

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Select Language:</Text>
        <Picker
          selectedValue={selectedLanguage}
          onValueChange={(itemValue) => setSelectedLanguage(itemValue)}
          style={styles.picker}
        >
          {languages.map((lang) => (
            <Picker.Item key={lang} label={lang} value={lang} />
          ))}
        </Picker>
      </View>

      <Card containerStyle={styles.card}>
        <Card.Title>Overall Progress</Card.Title>
        <ProgressChart
          data={[currentProgress.overallProgress]}
          width={300}
          height={200}
          strokeWidth={16}
          radius={32}
          chartConfig={chartConfig}
          hideLegend={true}
        />
        <Text style={styles.progressText}>
          {`${(currentProgress.overallProgress * 100).toFixed(0)}%`}
        </Text>
      </Card>

      <Card containerStyle={styles.card}>
        <Card.Title>Skill Breakdown</Card.Title>
        <ProgressChart
          data={{
            labels: ["Vocabulary", "Grammar", "Listening", "Speaking"],
            data: [
              currentProgress.vocabularyProgress,
              currentProgress.grammarProgress,
              currentProgress.listeningProgress,
              currentProgress.speakingProgress
            ]
          }}
          width={300}
          height={220}
          strokeWidth={16}
          radius={32}
          chartConfig={chartConfig}
          hideLegend={false}
        />
      </Card>

      <Card containerStyle={styles.card}>
        <Card.Title>Weekly Activity</Card.Title>
        <LineChart
          data={{
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            datasets: [{ data: currentProgress.weeklyActivity }]
          }}
          width={300}
          height={200}
          chartConfig={chartConfig}
          bezier
          style={styles.lineChart}
        />
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#3498db',
    padding: 20,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#ffffff',
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    marginRight: 10,
  },
  picker: {
    flex: 1,
  },
  card: {
    borderRadius: 10,
    marginBottom: 20,
  },
  progressText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  lineChart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default ProgressScreen;