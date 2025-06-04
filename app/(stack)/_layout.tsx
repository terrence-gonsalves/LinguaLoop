import Colors from '@/constants/Colors';
import { Stack } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'onboarding',
};

export default function StackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.light.generalBG },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="languages" />
      <Stack.Screen name="connections" />
      <Stack.Screen name="achievements" />
      <Stack.Screen
        name="onboarding"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
} 