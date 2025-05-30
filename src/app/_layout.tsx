import React, { useEffect, useState } from 'react';
import { Slot, useRouter, SplashScreen } from 'expo-router'; 
import { ActivityIndicator, View, StyleSheet } from 'react-native'; 
import { supabase } from '../utils/supabaseConfig'; 
import { Session } from '@supabase/supabase-js';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null); 
  const [appIsReady, setAppIsReady] = useState(false); 
  const router = useRouter(); 

  useEffect(() => {
    
    // initialize the app by checking the current session
    async function initializeApp() {
      try {
        const { data: { session } } = await supabase.auth.getSession(); 
        setSession(session);
      } catch (error) {
        console.error("Error getting initial session:", error);
        // handle error, e.g., by logging out or showing an error message
      } finally {
        await SplashScreen.hideAsync();
        setAppIsReady(true);
      }
    }

    initializeApp();

    // set up a listener for authentication state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        
        if (newSession) {
          router.replace('/(app)'); // authenticated user
        } else {
          router.replace('/(auth)/login'); // login screen
        }
      }
    );

    // unsubscribe from the auth listener when the component unmounts
    return () => {
      if (authListener && authListener.subscription) authListener.subscription.unsubscribe();
    };
  }, []);

  // loading indicator while the app is initializing
  if (!appIsReady) {
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