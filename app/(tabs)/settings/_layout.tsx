import { Stack } from 'expo-router/stack';

import Colors from '@/constants/Colors';

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{
          headerShown: true,
          headerTitle: 'Settings',
          headerStyle: { backgroundColor: Colors.light.background },
          headerShadowVisible: true,
        }}
      />
    </Stack>
  );
} 