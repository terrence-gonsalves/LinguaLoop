import { Colors } from '@/constants/Colors';
import { useAuth } from '@/lib/auth-context';
import { router, Tabs } from 'expo-router';
import { useEffect } from 'react';
import { MaterialCommunityIconsIcon, MaterialIconsIcon } from '../../components/navigation/TabBarIcons';

export default function TabLayout() {
    const { session, profile, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !session) {
            // Redirect to login if not authenticated
            router.replace('../(auth)/login');
        } else if (session && profile && !profile.onboarding_completed) {
            // Redirect to onboarding if not completed
            router.replace('../onboarding');
        }
    }, [session, profile, isLoading]);

    // Don't render anything until we've checked auth state
    if (isLoading || !session) {
        return null;
    }

    return (
        <Tabs screenOptions={{ 
            headerShown: false, 
            tabBarShowLabel: false,
            tabBarActiveTintColor: Colors.light.tabIconSelected,
            tabBarInactiveTintColor: Colors.light.tabIconDefault }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color, focused }) => (
                        <MaterialIconsIcon name={focused ? 'dashboard' : 'dashboard'} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="track"
                options={{
                    title: 'Track Activity',
                    tabBarIcon: ({ color, focused }) => (
                        <MaterialCommunityIconsIcon name={focused ? 'plus-circle-outline' : 'plus-circle-outline'} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="reports"
                options={{
                    title: 'Reports',
                    tabBarIcon: ({ color, focused }) => (
                        <MaterialIconsIcon name={focused ? 'bar-chart' : 'bar-chart'} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, focused }) => (
                        <MaterialIconsIcon name={focused ? 'person' : 'person'} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="(settings)/index"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, focused }) => (
                        <MaterialIconsIcon name={focused ? 'settings' : 'settings'} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}