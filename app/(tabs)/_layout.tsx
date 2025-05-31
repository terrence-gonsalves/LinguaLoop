import { Tabs } from 'expo-router';
import React from 'react';

import { EntypoIcon, FoundationIcon, MaterialIconsIcon } from '@/components/navigation/TabBarIcons';
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
                        <MaterialIconsIcon name={focused ? 'dashboard' : 'dashboard'} color={color} />
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
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, focused }) => (
                        <EntypoIcon name={focused ? 'user' : 'user'} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="(settings)"
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