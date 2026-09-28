import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../utils/supabaseConfig';

const HomeScreen = () => {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email || 'N/A');
        } else {
          setUserEmail('');
        }
      } catch (error) {
        console.error("Error fetching user email:", error);
        setUserEmail('Error fetching email');
      }
    };

    fetchUserEmail();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserEmail(session.user.email || 'N/A');
      } else {
        setUserEmail('');
      }
    });

    return () => {
      if (authListener && authListener.subscription) authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Language Tracker!</Text>
      {userEmail ? (
        <Text style={styles.subtitle}>Currently logged in as: {userEmail}</Text>
      ) : (
        <Text style={styles.subtitle}>Loading user info...</Text>
      )}

      <Button
        title="Manage Languages"
        onPress={() => router.navigate('/(app)/language-management')}
        style={styles.button}
      />
      <Button
        title="Start Tracking Time"
        onPress={() => router.navigate('/(app)/time-tracker')}
        style={styles.button}
      />
    </View>
  );
};

// EXPORT OPTIONS HERE FOR THIS SCREEN
export const options = {
  title: 'Home', // Set the header title for the Home screen
  // If you removed headerRight from _layout.js, you'd define it here:
  // headerRight: () => (
  //   <Button title="Logout" onPress={() => { /* logout logic */ }} color="red" />
  // ),
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
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 30,
    textAlign: 'center',
    color: '#666',
  },
  button: {
    marginVertical: 10,
    width: '80%',
  },
});

export default HomeScreen;