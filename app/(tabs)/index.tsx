import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { Card } from 'react-native-elements';
import { BarChart } from 'react-native-chart-kit';

const DashboardScreen = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  
  // Placeholder data - replace with actual data from your state management solution
  const user = {
    name: 'John Doe',
    avatar: 'https://via.placeholder.com/150',
  };
  
  const languages = ['All', 'Spanish', 'French', 'German', 'Japanese'];
  
  const stats = {
    totalHours: 120,
    streak: 15,
    wordsLearned: 500,
  };
  
  const weeklyData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [2, 3, 1, 4, 2, 3, 5],
      },
    ],
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <View style={styles.headerText}>
            <Text style={styles.greeting}>Hello, {user.name}!</Text>
            <Text style={styles.subgreeting}>Ready to learn today?</Text>
          </View>
        </View>

        <View style={styles.languageSelector}>
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

        <View style={styles.statsContainer}>
          <Card containerStyle={styles.statCard}>
            <Card.Title>Total Hours</Card.Title>
            <Text style={styles.statValue}>{stats.totalHours}</Text>
          </Card>
          <Card containerStyle={styles.statCard}>
            <Card.Title>Current Streak</Card.Title>
            <Text style={styles.statValue}>{stats.streak} days</Text>
          </Card>
          <Card containerStyle={styles.statCard}>
            <Card.Title>Words Learned</Card.Title>
            <Text style={styles.statValue}>{stats.wordsLearned}</Text>
          </Card>
        </View>

        <Card containerStyle={styles.chartCard}>
          <Card.Title>Weekly Progress (hours)</Card.Title>
          <BarChart
            data={weeklyData}
            width={300}
            height={200}
            yAxisSuffix="h"
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            style={styles.chart}
          />
        </Card>

        <TouchableOpacity style={styles.startSessionButton}>
          <Text style={styles.startSessionButtonText}>Start New Session</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subgreeting: {
    fontSize: 14,
    color: '#666',
  },
  languageSelector: {
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  statCard: {
    width: '30%',
    margin: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  chartCard: {
    margin: 10,
    borderRadius: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  startSessionButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    margin: 20,
    alignItems: 'center',
  },
  startSessionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DashboardScreen;