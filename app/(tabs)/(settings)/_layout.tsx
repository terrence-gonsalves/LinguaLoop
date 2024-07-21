import { Stack } from "expo-router";

export default function SettingsLayout() {
    return (
        // this is where the stack will go for the various settings screen.
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
    );
}