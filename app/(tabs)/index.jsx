import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Card } from 'react-native-elements';
import { supabase } from '../../utils/supabase';

const Dashboard = ({ navigation }) => {
  const [totalTime, setTotalTime] = useState(0);
  const [languageBreakdown, setLanguageBreakdown] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Fetch data from Supabase
    // This is a placeholder for actual data fetching logic
    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching dashboard data:', error);
    } else {
      // Process the data and update state
      // This is a simplified example
      setTotalTime(data.reduce((acc, entry) => acc + entry.duration, 0));
      setRecentActivities(data);
      // You would need to implement more complex logic for language breakdown and streak
    }
  };

  const startNewSession = () => {
    navigation.navigate('NewSession');
  };

  return (
    <ScrollView style={styles.container}>
      <Card>
        <Card.Title>Total Learning Time</Card.Title>
        <Text style={styles.totalTime}>{totalTime} minutes</Text>
      </Card>

      <Card>
        <Card.Title>Language Breakdown</Card.Title>
        <BarChart
          data={{
            labels: languageBreakdown.map(item => item.language),
            datasets: [{
              data: languageBreakdown.map(item => item.time)
            }]
          }}
          width={300}
          height={220}
          yAxisLabel=""
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
        />
      </Card>

      <Card>
        <Card.Title>Recent Activities</Card.Title>
        {recentActivities.map((activity, index) => (
          <Text key={index}>{activity.language}: {activity.duration} minutes</Text>
        ))}
      </Card>

      <Card>
        <Card.Title>Current Streak</Card.Title>
        <Text style={styles.streak}>{currentStreak} days</Text>
      </Card>

      <TouchableOpacity style={styles.button} onPress={startNewSession}>
        <Text style={styles.buttonText}>Start New Session</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  totalTime: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  streak: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    margin: 20,
  },
  buttonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default Dashboard;