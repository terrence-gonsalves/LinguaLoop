import Colors from '@/constants/Colors';
import { Stack } from 'expo-router/stack';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export const unstable_settings = {
  initialRouteName: 'onboarding',
};

export default function StackLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          contentStyle: { backgroundColor: Colors.light.generalBG },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="language-settings/index" />
        <Stack.Screen 
          name="language-settings/add" 
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
            animationDuration: 200,
            headerShown: false,
          }}
        />
        <Stack.Screen name="edit-profile" options={{ title: 'Edit Profile' }} />
        <Stack.Screen name="connections" />
        <Stack.Screen name="achievements" />
        <Stack.Screen name="about" options={{ title: 'About' }} />
        <Stack.Screen name="feedback" options={{ title: 'Feedback' }} />
        <Stack.Screen name="help" options={{ title: 'Help Center' }} />
        <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
        <Stack.Screen name="goals" options={{ title: 'Goals' }} />
        <Stack.Screen name="terms" options={{ title: 'Terms & Conditions' }} />
        <Stack.Screen name="privacy" options={{ title: 'Privacy Policy' }} />
        <Stack.Screen
          name="onboarding"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 