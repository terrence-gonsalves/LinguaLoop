import React, { useEffect, useState } from 'react';
import { Slot, useRouter, SplashScreen } from 'expo-router';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { supabase } from '../utils/supabaseConfig';

// prevent the splash screen from automatically hiding.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [initialRoute, setInitialRoute] = useState(null);
  const router = useRouter();

  useEffect(() => {
    let unsubscribe; 

    const setupAuthAndDetermineInitialRoute = async () => {
      
        // get the current session immediately to determine the initial state.
      const { data: { session }, error: getSessionError } = await supabase.auth.getSession();

      if (getSessionError) {
        console.error("Error getting initial session:", getSessionError);
        setInitialRoute('/(auth)/login'); 
      } else if (session) {
        setInitialRoute('/(app)');
      } else {
        setInitialRoute('/(auth)/login');
      }

      // Hide the splash screen
      SplashScreen.hideAsync();

      // set up the real-time authentication listener.
      // listener will handle ALL subsequent authentication state changes (login, logout, refresh).
      const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
        if (newSession) {
          router.replace('/(app)');
        } else {
          router.replace('/(auth)/login');
        }
      });

      unsubscribe = data.subscription.unsubscribe;
    };

    setupAuthAndDetermineInitialRoute();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  if (initialRoute === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  
  return <Slot />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});