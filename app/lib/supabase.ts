import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl as string;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please check your app.json file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  created_at: string;
  email: string;
  name: string | null;
  user_name: string | null;
  onboarding_completed: boolean;
  native_language: string;
};

export type Language = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  master_language_id: string;
};

export default supabase; 