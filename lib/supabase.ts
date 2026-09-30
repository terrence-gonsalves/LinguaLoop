import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { AppState } from 'react-native';
import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl as string;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please check your environment variables and app.config.js file.');
}

// persist the session in AsyncStorage so it survives the app being killed
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// only refresh the token while the app is in the foreground. supabase-js can't
// tell on its own when a React Native app is backgrounded, so without this a
// session can expire while the app sleeps.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export type Profile = {
  id: string;
  created_at: string;
  email: string;
  name: string | null;
  user_name: string | null;
  onboarding_completed: boolean;
  native_language: string;
  about_me: string | null;
  avatar_url: string | null;
};

export type Language = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  master_language_id: string;
};

export default supabase; 