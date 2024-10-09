import { Tabs } from 'expo-router';
import React from 'react';

import { FoundationIcon, MaterialIcon, FontAwesomeIcon } from '@/components/navigation/TabBarIcons';
import { Colors } from '@/constants/Colors';

export default function TabLayout() {
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
                        <MaterialIcon name={focused ? 'dashboard' : 'dashboard'} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="progress"
                options={{
                    title: 'Progress',
                    tabBarIcon: ({ color, focused }) => (
                        <FoundationIcon name={focused ? 'graph-bar' : 'graph-bar'} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="language"
                options={{
                    title: 'Languages',
                    tabBarIcon: ({ color, focused }) => (
                        <FontAwesomeIcon name={focused ? 'language' : 'language'} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="tracking"
                options={{
                    title: 'Tracking',
                    tabBarIcon: ({ color, focused }) => (
                        <MaterialIcon name={focused ? 'track-changes' : 'track-changes'} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, focused }) => (
                        <MaterialIcon name={focused ? 'settings' : 'settings'} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}