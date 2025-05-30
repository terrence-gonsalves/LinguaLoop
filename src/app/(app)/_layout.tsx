import { Stack } from 'expo-router';  
import { Button, Alert, } from 'react-native'; 
import { supabase } from '../../utils/supabaseConfig';

export default function AppLayout() {
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut(); 
      if (error) {
        console.error("Logout error:", error);
        // Toast.show({
        //   text1: 'Logout Error',
        //   text2: error.message,
        //   type: 'error',
        // });
      } 
    } catch (error) {
      console.error("Logout unexpected error:", error);
      Alert.alert('Error', 'An unexpected error occurred during logout.');
    }
  };

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Dashboard', 
          headerRight: () => (
            <Button title="Logout" onPress={handleLogout} color="red" />
          ),
        }}
      />
      <Stack.Screen
        name="language-management"
        options={{ title: 'Manage Languages' }}
      />
      <Stack.Screen
        name="time-tracker"
        options={{ title: 'Time Tracker' }}
      />
    </Stack>
  );
}
