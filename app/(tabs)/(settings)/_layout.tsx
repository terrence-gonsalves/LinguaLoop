import { Stack } from "expo-router";

export default function SettingsLayout() {
    return (
        <Stack  
            screenOptions={{
                headerShown: true
            }}>
            <Stack.Screen name="index" options={{headerShown: false}} />
            <Stack.Screen name="languages" options={{  title: 'Manage Languages' }} />
            <Stack.Screen name="notifications" options={{  title: 'Notifications' }} />
            <Stack.Screen name="password" options={{  title: 'Password Reset' }} />
            <Stack.Screen name="dailyGoal" options={{  title: 'Daily Goal' }} />
            <Stack.Screen name="contact" options={{  title: 'Contact' }} />
            <Stack.Screen name="feedback" options={{  title: 'Feedback' }} />
            <Stack.Screen name="about" options={{  title: 'About' }} />
            <Stack.Screen name="terms" options={{  title: 'Terms' }} />
            <Stack.Screen name="eula" options={{  title: 'EULA' }} />
            <Stack.Screen name="acknowledgements" options={{  title: 'Acknowledgements' }} />
        </Stack>
    );
}