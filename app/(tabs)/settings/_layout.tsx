import { Stack } from 'expo-router/stack';

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="test" 
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
} 