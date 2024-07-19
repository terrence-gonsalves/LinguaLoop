import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';

export default function TabLayout() {
    return (
        <Tabs screenOptions={{headerShown: false}}>
            <Tabs.Screen
                name="index"
                options={{
                title: 'Dashboard',
                tabBarIcon: ({ color, focused }) => (
                    <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
                ),
                }}
            />
            <Tabs.Screen
                name="progress"
                options={{
                title: 'Progress',
                tabBarIcon: ({ color, focused }) => (
                    <TabBarIcon name={focused ? 'code-slash' : 'code-slash-outline'} color={color} />
                ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                title: 'Profile',
                tabBarIcon: ({ color, focused }) => (
                    <TabBarIcon name={focused ? 'code-slash' : 'code-slash-outline'} color={color} />
                ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                title: 'Settings',
                tabBarIcon: ({ color, focused }) => (
                    <TabBarIcon name={focused ? 'code-slash' : 'code-slash-outline'} color={color} />
                ),
                }}
            />
        </Tabs>
    );
}