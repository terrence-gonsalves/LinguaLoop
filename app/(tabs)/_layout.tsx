import { useAuth } from '@/lib/auth-context';
import { router } from 'expo-router';
import { Tabs } from 'expo-router/tabs';
import { useEffect } from 'react';
import TabBarIcon from '../../components/navigation/TabBarIcons';

// Default colors as fallback
const defaultColors = {
  light: {
    tabIconSelected: '#E86C00',
    tabIconDefault: '#9CA3AF',
    background: '#FFFFFF',
    border: '#E5E7EB',
  }
};

export default function TabLayout() {
    const { session, profile, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !session) {
            // redirect to login if not authenticated
            router.replace('/(auth)/login');
        } else if (session && profile && !profile.onboarding_completed) {
            // redirect to onboarding if not completed
            router.replace('/onboarding');
        }
    }, [session, profile, isLoading]);

    // don't render anything until we've checked auth state
    if (isLoading || !session) {
        return null;
    }

    return (
        <Tabs 
            screenOptions={{ 
                headerShown: false, 
                tabBarShowLabel: false,
                tabBarActiveTintColor: defaultColors.light.tabIconSelected,
                tabBarInactiveTintColor: defaultColors.light.tabIconDefault,
                tabBarStyle: {
                    backgroundColor: defaultColors.light.background,
                    borderTopColor: defaultColors.light.border,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color }) => (
                        <TabBarIcon type="material" name="dashboard" color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="track"
                options={{
                    title: 'Track',
                    tabBarIcon: ({ color }) => (
                        <TabBarIcon type="material-community" name="plus-circle-outline" color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="reports"
                options={{
                    title: 'Reports',
                    tabBarIcon: ({ color }) => (
                        <TabBarIcon type="material" name="bar-chart" color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => (
                        <TabBarIcon type="material" name="person" color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color }) => (
                        <TabBarIcon type="material" name="settings" color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}