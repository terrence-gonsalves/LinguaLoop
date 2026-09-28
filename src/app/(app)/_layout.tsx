import { Stack } from 'expo-router';
import { supabase } from '../../utils/supabaseConfig';
import { Button, Alert } from 'react-native';

export default function AppLayout() {
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        Alert.alert('Logout Error', error.message);
      } else {
        Alert.alert('Success', 'Logged out successfully!');
      }
    } catch (error) {
      console.error("Logout unexpected error:", error);
      Alert.alert('Error', 'An unexpected error occurred during logout.');
    }
  };

  return (
    <Stack>
      {/* Expo Router automatically creates screens for files in the app directory.
        We typically define options directly in the screen file itself 
        (e.g., app/(app)/index.js will export `options`).

        We keep 'index' here to define the headerRight which is a common layout-level concern.
        If you prefer to define the logout button directly in index.js, you can remove this Stack.Screen as well.
      */}
      <Stack.Screen
        name="index"
        options={{
          headerRight: () => (
            <Button title="Logout" onPress={handleLogout} color="red" />
          ),
          // title will be defined in app/(app)/index.js itself
        }}
      />
      {/* Screens like 'language-management' and 'time-tracker' are automatically
        included in this stack if their files exist (e.g., app/(app)/language-management.js).
        Their navigation options (like 'title') should be defined WITHIN their respective files.
      */}
    </Stack>
  );
}