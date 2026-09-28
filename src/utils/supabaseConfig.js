import 'react-native-url-polyfill/auto'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { createClient } from '@supabase/supabase-js'; 

// --- IMPORTANT: Replace with your actual Supabase project URL and Anon Public Key ---
const supabaseUrl = 'https://gspqgsdvpygdksjzvvep.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzcHFnc2R2cHlnZGtzanp2dmVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1NDcxNTUsImV4cCI6MjA2NDEyMzE1NX0.Smd13NOwA9dpUZb0psGEaGvN0HRcEKbnS3yMwjZDrTo';
// -----------------------------------------------------------------------------------

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage, 
    autoRefreshToken: true, 
    persistSession: true,   
    detectSessionInUrl: false, 
  },
});