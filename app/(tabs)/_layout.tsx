import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { Tabs } from 'expo-router/tabs';

import { useEffect, useRef } from 'react';

import TabBarIcon from '@/components/navigation/TabBarIcons';

import { useAuth } from '@/lib/auth-context';
import { getGoalIdFromResponse, syncGoalNotifications } from '@/lib/goal-notifications';

// default colors as fallback
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

    const isReady = !!session && !!profile?.onboarding_completed;

    // rebuild the goal reminders once per signed-in user, which covers reinstalls
    // and goals changed on another device
    const syncedUserIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (!isReady || !profile || syncedUserIdRef.current === profile.id) return;

        syncedUserIdRef.current = profile.id;
        syncGoalNotifications(profile.id);
    }, [isReady, profile]);

    // open the goal when its "your goal ended" reminder is tapped. this hook
    // returns the response that launched the app (cold start) and any later
    // one while the app is running.
    const lastNotificationResponse = Notifications.useLastNotificationResponse();
    const handledNotificationRef = useRef<string | null>(null);

    useEffect(() => {
        if (!isReady || !lastNotificationResponse) return;

        const requestId = lastNotificationResponse.notification.request.identifier;
        const goalId = getGoalIdFromResponse(lastNotificationResponse);

        if (!goalId || handledNotificationRef.current === requestId) return;

        handledNotificationRef.current = requestId;
        router.push(`/goals/${goalId}/edit`);

        // so a remount of this layout doesn't open the goal again
        Notifications.clearLastNotificationResponseAsync();
    }, [isReady, lastNotificationResponse]);

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