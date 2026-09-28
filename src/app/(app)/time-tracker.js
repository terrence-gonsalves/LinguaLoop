import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TimeTrackerScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Time Tracker Screen</Text>
      {/* You'll build out your timer, activity selection, etc., here */}
    </View>
  );
};

// EXPORT OPTIONS HERE FOR THIS SCREEN
export const options = {
  title: 'Time Tracker', // Set the header title for the Time Tracker screen
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default TimeTrackerScreen;