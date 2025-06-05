import { Stack } from 'expo-router/stack';

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
} 