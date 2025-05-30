import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router'; 
import { supabase } from '../../utils/supabaseConfig'; 

const HomeScreen = () => {
  const router = useRouter(); 
  const [userEmail, setUserEmail] = useState(''); 

  useEffect(() => {
    // fetch current user's email
    const fetchUserEmail = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser(); 
        if (user) {
          setUserEmail(user.email || 'N/A');
        } else {
          setUserEmail(''); // clear email if no user is found
        }
      } catch (error) {
        console.error("Error fetching user email:", error);
        setUserEmail('Error fetching email');
      }
    };

    fetchUserEmail(); 

    // Set up a listener for authentication state changes to keep the user email updated.
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserEmail(session.user.email || 'N/A');
      } else {
        setUserEmail('');
      }
    });

    // Cunsubscribe from the auth listener when the component unmounts
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
      {/* You can add more buttons here for other features like 'Reports', 'Settings', etc. */}
    </View>
  );
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
