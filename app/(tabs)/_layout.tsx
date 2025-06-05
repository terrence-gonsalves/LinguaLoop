import { useAuth } from '@/lib/auth-context';
import { router } from 'expo-router';
import { Tabs } from 'expo-router/tabs';
import { useEffect } from 'react';
import { Colors } from '../../app/providers/theme-provider';
import TabBarIcon from '../../components/navigation/TabBarIcons';

interface TabIconProps {
    color: string;
    focused: boolean;
}

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
        <Tabs 
            screenOptions={{ 
                headerShown: false, 
                tabBarShowLabel: false,
                tabBarActiveTintColor: Colors.light.tabIconSelected,
                tabBarInactiveTintColor: Colors.light.tabIconDefault,
                tabBarStyle: {
                    backgroundColor: Colors.light.background,
                    borderTopColor: Colors.light.border,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color, focused }: TabIconProps) => (
                        <TabBarIcon type="material" name="dashboard" color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="track"
                options={{
                    title: 'Track Activity',
                    tabBarIcon: ({ color, focused }: TabIconProps) => (
                        <TabBarIcon type="material-community" name="plus-circle-outline" color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="reports"
                options={{
                    title: 'Reports',
                    tabBarIcon: ({ color, focused }: TabIconProps) => (
                        <TabBarIcon type="material" name="bar-chart" color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, focused }: TabIconProps) => (
                        <TabBarIcon type="material" name="person" color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="(settings)"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, focused }: TabIconProps) => (
                        <TabBarIcon type="material" name="settings" color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}